# Mirror

Mirror creates subscribable objects. This README will be expanded on
more completely after Mirror has advanced out of Alpha. At this moment
Mirror is still under heavy development 
and is decidedly ***NOT ready for use in production***

## Mirrors

A Mirror is a subscribable change engine; it has value(s), built-in and custom change actions, can be subscribed to 
to receive updates.

A Mirror is designed to allow validation -- that is -- invalid formats are banned from submission and 
do not trigger subscriber notifications (or crash the subject). 

Also, Mirrors have a transactional update cycle, in which a variety of child values and sub-values
can be updated in a single update cycle. This allows the mirrors and any child mirrors to be
validated before subscription notifications occur. 

Mirrors follow the following mandates; they are:

* **synchronous** -- all updates happen inline, allowing for immediate inspection of the curent value, even during an action
* **structured** -- you can define strict schema for mirrors and mirror fields, rejecting bad values.
* **testable** -- as an object with testable properties, they can easily be tested free from any view scaffolding. 
* **independent** -- Mirrors are not bound to any particular rendering framework (React, Vue, Angular) and can be used with all of them.
* **transactional** -- changes that trigger validation errors redact themselves and throw, without notifying subscribers of bad data. 
* **self-contained** -- unlike Redux and all similar patterns, the definition of a Mirror is contained entirely inside its definition.

These traits allow for a strong, managed state experience in any context from React to Angular and even 
node, bare-metal design or any other context.

## Subscriptions 

Getting updates from a Mirror follows the standard observable pattern: 

```javascript
const myMirror = new Mirror(3);
const sub = myMirror.subscribe((value) => {
  console.log('update: ', value);
});
// 'update: 3'

myMiror.next(4);
// 'update: 4';

sub.unsubscribe();
myMirror.next(5);
// [no update]

````

more formally you can `subscribe({next(value) {...}}`.

note, subscriptions are cancellable; this is important for situations where the mirrors; lifespan is longer
than the lifespan of the observation. 

### Validation tests

Validation tests are designed to reject bad candidates for change. "Bad" can mean wrong type, but can also
relate to other properties of the mirror or external factors. 

```javascript

const numeric = new Mirror(
  {
    number: 0,
    min: -5,
    max: 5,
  },
  {
    name: 'safe-number',
    test(next, mirror) {
      const { number } = next;
      if (typeof number !== 'number') return 'not a number';
      if (number > mirror.value.max) return `must be <= ${mirror.value.max}`;
      if (number < mirror.value.min) return `must be >= ${mirror.value.min}`;
    },
  },
);

numeric.$do.setNumber(4);
console.log('value: ', numeric.value.number); // 'value: 4'
let e = null;
try {
  numeric.$do.setNumber(6);
} catch (err) {
  console.log('error: ', err); // 'error:  { target: 'safe-number', error: 'must be <= 5' }';
  e = err;
}

numeric.$do.setNumber(2);
console.log('value: ', numeric.value.number); // 'value: 2'

```

If your mirror has one (or more) tests, it will reject values that emit/return errors from the test function.

Every time a Mirror's value is submitted (via next(nextValue)), the update event queue 
polls any errors returned/thrown from any test present in the mirror.  
If that function (exists and) returns / throws errors, then the submitted value is silently rejected 
and no observed notification occurs. 

If the next value contains keys of managed children, those children are passed trial values
and tested. Any errors in a pending child value are treated as errors in the root and 
both the parent and child values are flushed silently. 

If the child values are good, they are committed, notifying any direct subscribers;
then the parent is committed, notifying its subscribers of their updates. 

This careful cycle allows for fine-grained control of values and minimizes the possibility
of bad values leaking through the system; "bad" is about more than base type (string, array, etc);
it is also about any business logic (range, character count) you wish to enforce.

Validation can be used to enforce type on field values; it can also be used to enforce larger business 
logic concerns. 

Validation errors throw; however they do not terminate the Mirror (an RxJS-ism) or trigger any notification to any subscribers. 

## Actions

Actions are functions that you can run to enact change on Mirror instances. 

They are for the most part identical to running an external function to change the mirrors' state; except,
when an action is running *all subscription updates are suspended until the action completes (or errors out).*
This means you can change the mirrors' value several times, and even change child mirror values,
and only on the completion of the action are updates broadcast. 

Actions do not return values. If you want to capture values generated inside an action 
you need to pass a callback to the action and send it information from inside the action. 

### Asynchronicity in actions

Actions are synchronous by nature -- from the point of view of the mechanics of the Mirror system. 
If you trigger any async/promise behavior inside an action it will complete -- but it will do so *after* the
actions changes have been flushed/committed into the Mirror and any changed children. 

The safest way to manage async in actions is to encase the async resolution (i.e., the then handler) 
in a single separate action call for maximum containment: i.e., 

```javascript

let changeId = 0;
const myMirror = new Mirror(
  {
    current: 0,
    pending: new Set(),
  },
  {
      actions: {
        newPending(change, callback) {
          changeId += 1;
          let id = changeId;
          const pending = {change, id};
          const nextSubmitted = new Set(my.value.pending);
          nextSubmitted.add(pending);
          me.$do.setPending(nextSubmitted);
          callback(id);
        },
        sendToServer(me, change) {
          let id = null;
          me.$do.newPending(change, (nextId) => {
            id = nextId;
          });
          axios.put('http://server.com/change', {change})
            .then((response) => me.$do.acceptChange(response, id))
            .catch((err) => me.$do.removePending(id));
        },
        acceptChange(me, response, id){
          me.$do.removePending(id);
          if (me.current !== response.data) {
            me.$do.setCurrent(response.data);
          }
        },
        removePending(me, id) {
          const pendingChanges = Array.from(me.value.pending.values());
          const without = pendingChanges.filter((change) => change.id !== id);
          if (without.length < pendingChanges.length) {
            me.$do.setPending(new Set(pendingChanges));
          }
        }
  }
});

```

## Nesting Actions 

Actions can even call other actions. So you can create a complex nested series of updates, and their effects
are buffered internally until all actions complete.

### Errors in actions

An un-trapped error in an action will flush all pending changes that were made after it started, and will be thrown. 
this means, for instance, you can call an action from another action, catch any error around that call, and be 
confident that the state of the mirror is unchanged; i.e., all buffered changes to date from other activity in the action
is the same, *but* all changes from the subaction have been cleared.

## The buffer (a very technical detail)

During actions and updates from next, changes and actions are registered in a buffer array. During this transition
all mirrors will reflect any buffered values as if these changes had been committed. 

as long as there are actions in the buffer, the buffer remains active. After an error free action, or during next
after validating that the mirrors all are error free, the buffer is flushed. 

In flushing, if the buffer is error free and action free, buffered changes are committed to the mirror and broadcast. 

Untrapped errors in sub-actions will cause an error in the calling action, causing its effects to be removed from the buffer,
eventually clearing all the actions and their changes from the buffers, resulting in a no-op action with no effects on
the broadcasting of updates, and the mirror is reset to its previous state.

## Binding to React components

Hooks are the easiest way to bind Mirrors to components. Local state can be bound and created in effects; global state
can be imported directly or pulled from context. 

```javascript

export default function BoundLogin () {
  
  const [values, setValues] = useState(false);
  const [fieldMirror, setFieldMirror] = useState(false);
  useEffect(() => {
    const mirror = new Mirror({userName: '', password: ''}, {
      test({userName, password}) {
        if (typeof userName !== 'string') return 'userName must be a string';
        if (typeof password !== 'string') return 'password must be a string';
      },
      subjects: {
        complete({userName, password})  {
          return userName && password;
        },
        paswordValid({password}) {
          return /^[a-zA-Z0-9_-]{8,}$/.test(password);
        }
      }
    });
    setFieldMirror(mirror);
    const sub = mirror.subscribe(setValues);
    return () => sub.unsubscribe();
  }, 
  []);
  
  if (values && fieldMirror) {
    const {setUserName, setPassword} = fieldMirror.$do; // don't directly bind $do
    return <Login {...values} setUserName={setUserName} setPassword={setPassword} />;
  }
}

```

In a class component you can use a local variable in a similar manner. 

```javascript
class BoundLogin extends Component {
  constructor(props) {
    super(props);
    this._fieldMirror = new Mirror({ // same as above
       });
    
    this.state = this._fieldMirror.value;
  }
  
  componentDidMount() {
    this._sub = mirror.subscribe((values) => {
      this.setState(values);
    });
  }
  
  componentWillUnmount() {
    if (this._sub) this._sub.unsubscribe();
  }

  render() {
    const {setUserName, setPassword} = fieldMirror.$do; // don't directly bind $do
    return <Login {...values} setUserName={setUserName} setPassword={setPassword} />;
  }

}

```
If you have a global Mirror, you can export it as a resource and bind it in the same way .

Mirrors can also be passed down as context; the whole mirror can be a context's value, or,
if you want context subscribers to update with the mirror, by putting the mirror in local state (as above) 
and sharing the context and the value (as above, via `{fieldMirror, values}`) as the contexts' value. 

## Related Libraries

### Mirrors and RxJS

Mirrors inherit from RxJS' BehaviorSubject. That means it interoperates with all RxJS functionality.

### Immer and Mirror

The value of a TYPE_OBJECT or TYPE_MAP is made immutable via Immer. Immer's produce is bundled with Mirror.

That means if you want to update keys you must either:

* call `myMirror.mutate((draft) => draft.foo = 3)`; // operates in the immer context;
* call `myMirror.next(produce(myMirror.value, (draft) => {draft.foo = 3})`; // explicitly acts in the immer context
* call `myMirror.update({foo: 3})`; // will internally use immer to update your value, leaving other ones unchanged.
* call set(s) as in `myMirror.$do.setFoo(3)` // generally easier unless you need to validate a set of changes in parallel

## And lastly -- what is with all the dollar signs?

As Mirrors extend BehaviorSubjects, in order to minimize the possibility
of overlap between Mirror code and anything up the inheritance chain from
RXJS, all properties and methods of mirrors are prefixed with dollar signs. 
