# @Wonderlandlabs/Mirror

Mirror was written as a reaction to Redux and the family of patterns and software that came after it. 
In my opinion Redux was a singularly wrong opinion on how to handle state management, and the 
flaws in its architecture propogate to everything that accepts its assumptions as a good and proper way 
to manage data. 

## State is not supposed to be hard

Redux isn't the worst state engine in existence; its just the worst state engine that has 
millions of devs hypnotized into thinking its a really great thing and nothing out isThere is
as awesom as it. 

The prospect of sate is pretty simple

* have a known profile of data (a schema)
* be able to change the data (an action)
* be able to know from different points what the state is (an update)

Also, there is no reason a state system needs to be oriented to be a global registry. A good state system
should operate fine in a transient or a long-lived global artifact. 

## Async State is a terrible architectural conceit.

The last one is where React truly blows. After component "A" updates state isThere is a time where
it and only it knows that state has been changed but it hasn't broadcast; this is a model known as
"eventually consistent". That is maybe ok for say, an amazon order system, where an order can take a few
seconds/minutes, maybe in some context hours, to get fully registered --- but in a real time app 
eventually is too damn late. You should know instantly as soon as a change is made what the 
value is. 

Saga does allow for some reactivity and proper ordering of side effects, but its damn tough to read and debug. 

Most of the problem with debugging Redux is that is not a "thing" -- isThere is no redux class -- 
its a distributed federation of conventions scattered across way too many files. That makes summation
and coordination between multiple reducers difficult because only with Saga an one reducer know 
about another, and you have to do a LOT of work after every action to re-poll your multiple federated
states. 

In short isThere is no reason that state needs to be asynchronous at all. It doesn't benefit the
developer or the subscribers; it just allows for a lazy messaging and distribution system to 
not do the work of brodcasting until it feels like it. Worse yet, it creates a time gap between 
decision and response in which any number of things can happen because they are acting on outdated information.

## Actions are a mess

Actions are bad in both form and execution. 

### The form

Having seperate named delta functions that live in their own bubble is a messy way to accomplish change, that are based
on a few premises: 

1. the subject under change -- the "state object" or whatever -- doesn't need to have a schema 
2. there is no need to call one action from another action
3. there isn't any point between the execution of the action and the output of the result in which any other system needs to react to the action

### The execution 

This means, if you want to do any composition with actions: 

1. you have to send every composed part individually as a change, and allow any reactive code to respond after the fact. 
2. Any subscribers will pick up on all the noise from 1, which can be very expensive. 

Take for instance a Redux state that has a point {x, y}; it may have actions like SET_X (value), SET_Y (value), SCALE(scalar)
and OFFSET(x, y);

Well thats fine - but if you want to ensure x and y are numeric you have to either (a) put saga watchers on ALL these actions
(and any that haven't been written yet) or a generic observable on all changes to the whole state in a seperate global hook which
makes it really rough to test.

Redux is a "write first, manage afterwards" system. That style of change is puts all the wait on the calling context
to provide any buffer and check on the system before the change, and makes nested calling essentially impossible. 

Nested change is the foundation of any managed system. 

## Part of the solution: RxJS

RxJS solves some of these problems. RxJS provides that level of immediacy; when I state/next a value, 
immediately all subscribers' update listeners are called. However, there are some problems with a "way too immediate" model; it makes 
schema enforcement tough. Also, the fact that all emitters terminate on errors make "soft errors" 
a difficult thing to handle. 

### Even so, there is a cost for immediacy

Its easy to use streams for side effect of a change *after it has been registered*. its not as easy
to do interrupting pattens that sanitize or filter/reject bad data if your pattern is 'next/accept/broadcast'.
However, in Mirror isThere is a less final method; you can put changes through a pipeline in the form of a 
stream of updates that are themselves streams that either complete (and are accepted by the mirror) 
or are sent an error, which prevents the full execution of the action. 

## transactional and processing change

Mirror solves a lot of the problems with actions using a transaction buffer; the Mirrors value is advanced in a 
buffer until all the validation in the entire system approves the change. Actions are registered in the buffer as well,
meaning the transactional state remains open until the last action is complete/errors out. 

Any change in the transactional buffer reads as if it had been committed inside the run context of the actions, and externally,
so that you always have an immediate reference for the current state of state in the mirror even during the execution of transactions.

### Error handling. 

The test(s) that are registered with the Mirror can examine any pending change and terminate it (by throwing). 
This is an expected managed side effect, and you can even intercept sub-action errors and continue on in the body of another action. 
Any action can also throw, taking down any calling action that doesn't have try/catch in place, returning the mirror to the last 
stable state. 

This means you can either choose to manage errors at any level you want or at the least be assured that no subscribers
will ever get dirty data.

# Composition and emission control

One of the basic rules of software development is that writing large complex operations is 
actually just the act of writing and organizing a series of small simple(r) operations. However,
you cannot compose action if the "hearbeat" of notification is out of your control. 

Think about this. Your car starts making a knocking noise so you take it in to the shop. 
The mechanic says "ok I can take care of this but its going to take a week." You think okay its a pain,
but I guess I'll hear back to him in a week. But no - you get a text message stream from him: 

* "My guy parked it in the back lot"
* "Now I'm looking under the hood"
* "ok looks like you need a new transmission"
* "I'm going on line now to order a transmission"
* "I've ordered a new transmission. Should be here in a few days."
* "Ok the transmission is here...."

...And so on, you'd go apeshit. Because this guy can't take a microstep without telling you about it. 
You don't want or need this data - you just want one signal notification when your car is fixed and ready
for you to pick it up. 

So how do you do that with Redux? You can't because the tempo of notification is trapped to the series
of atomic operations - actions. 

All actions in Mirror are implicitly transactional. This means once one action is called any number of sub-steps
can trigger, but they will not generate notification until the outermost action is complete. Seperating change
and notification gives you a broad brush with which you can manage complex activity without overwhelming your dependent
listeners. 

# Scope of Use

Some stores are tactical and component scoped. For instance you have state and state control over a login form
that is not needed elsewhere in an application. Alternatively you may have a user scope with (amongst other things)
the identity of the logged in user that is needed nearly everywhere else. 

Right now we have one system (redux) that is optimized to sharing its content across the entire system;
even with reducers you still have one massive monolith.

Then you have a second set of native systems -- setState and hooks -- that manage local state. Mirror still depends on
hooks to export its values into view state, but you can bundle an entire local state system into a local mirror,
which allows you to run tests on it and interopate value changes from global states into the local level, 
using largely the same architetcure for local and global value management. 

## Not a knee-jerk React-ion

Part of the reason that Mirror has these abilities is that is was designed with React in mind -- 
but like RxJS it is not limited or dependent on React. It can be used with Preact, Vue, Angular or 
vanilla JavaScript as long as you write the proper bridge subscriptions between Mirrors and your
framework. The only requirement is that you unsubscribe all listeners when the recipient elements
go out of scope. Its even fine to use in server-side systems.

## And it tests. 

Mirrors are classic objects and are fantastically easy to test; they don't require any DOM spinup
(in most use cases) and can be spawned from a factory function whenever you want. You can even 
inject things like fetch methods into those functions and easily stub out network calls in a test 
scenario. 

The fact that Mirror instances are self-contained makes them much more amenable to basic test introspection.

# In Sum - the users' bill of rights.

this is the target list that Mirror delivers, and that you can't find in other systems

### I have the right to know what my state is at all time.

I have the right not to have to use async methods to track basic change. State should update when I want it to. 

### I have the right to intercept, filter and terminate any signal mid-flight.

I don't have to lose the ability to stop a change from occuring or be a slave to the tempo of my state system.
These signals include change requests as well as specific user actions, next signals and all meaningful 
triggers inside the mirror system. 

### I have the right to write dynamic state

I have the right to mix transient with long-lived state as the needs of my application change.

### I have the right to use normal f**king function when I want to design a procedure

An action is just a normal f**king function -- get over it.

### I have the right to code compositionally

...And in my normal function I have the right to get and call my states' fields and other actions.
This also means I have the right to pause updates during complex operations to prevent unhelpful 
mid-process broadcast of my sub-actions. 

### I have the right to design my state in a single easy to read file

really. One file. And it should be straightforward and easy to read. 

### I have the right to test my state using any testing mechanic I want. 

I shouldn't have to create a complex DOM simulation to test a business logic element. 
