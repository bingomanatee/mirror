# Mirror

Mirror creates subscribable objects. This README will be expanded on
more thoroguhly after Mirror has advanced out of Alpha. At this moment
Mirror is still under heavy development 
and is decidedly ***NOT ready for use in production***

## Mirrors and MirrorCollections

`Mirror` instances manage single values as an unstructured unit. 
This may be a good solution for very simple scenarios 
such as counters or other single-content problems. 

The `MirrorCollection` manages a set of values -- 
either a Map or a POJO Object. Schema constraints can be
put in its child fields. The value of a MirrorCollection's first parameter determines
the "type" of collection it is.

MirrorCollections can also have children which are Mirrors
(or MirrorCollections) that manage a single field of the
root MC's value. (In theory these can be nested,
though that still needs more rigorous testing).

MirrorCollections are child classes of Mirrors, so everything that 
is documented below about Mirrors apply to MirrorCollections. 

## Actions

Methods can be attached to Mirrors through `$addAct(name, fn)`
or in the constructor:

```javascript
const mir = new MirrorCollection({
  x: 0,
  y: 0
});

```

note that the collection itself is automatically prepended
to the function arguments; for the above you would call:

```javascript

mir.$do.offset(10, 5);

```

to offset x by 10 and y by 5. Conversely, there is no definitive
meaning for "this" in an action and its use is discouraged.

## Transactions

Mirror instances can have 
methods ("actions") and can transactionally lock values
to squash nested actions' updates to a single message.

This won't affect standard subscribers, but there are a set
of transctionally throttled properties --- $subscribe, 
$value, and $subject -- that respect transactional locking.

## Proxies

While mirrors have a deep library of methods dedicated to
maintaining and updating its values, 
you can access a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
that you can use to simply set and get its value(s). 

## RXJS under the hood

Mirrors extend BehaviorSubject and thus have all the API
that BehaviorSubjects express.

## $dollars and sense

To prevent namespace collision, nearly(1) all added structure of the mirror is prefixed
with '$', '_$' or '_$$'. 

----
(1) "do" and "my" are un-dollarsigned for a while but only
to prompt deprecation changes to projects converting from 
Looking Glass Engine to Mirror.

## Expanding MirrorCollection definition through $set or next

You can add new child fields to collections through either `$set('newName', newValue)`
or by adding a map of values (new an/or updates) through passing a map/object
of values using `myMirror.next({z: 30})`. Next, counter to what you may
expect from RxJS, works like setState in react - its inclusive of the current
value and merges past and new values. 

If you want to remove a key out of the value of a MirrorCollection, 
call the `mir.$delete('key')` function. This will both purge 
basic keys and remove and complete any attached children for that key.

## Events

Every change is accomplished through the transmission of events. 
This includes execution of user actions, value updates, `$set(...)` and `next`.

There is an advanced guide (TODO) that details how events play out 
but for now, know that under the hood you can listen for, mutate 
and delete any change or action by listening to is using `$on(actionName, fn, phase = PHASE_ON)`
that will give you access to an event in process. You can call error
on that event and terminate its execution, preventing other phases
from receiving the event. 

Good use cases for event filtering/cancelling include filtering of input 
data to disallow invalid/ badly formatted values or to sanitize them;
cleanly enforcing argument requirements on actions; and enforcing
schema on Mirror/MirrorCollection values. 
