# # @Wonderlandlabs/Mirror

## State is not supposed to be hard

Redux isn't the worst state engine in existence; its just the worst state engine that has 
millions of devs hypnotized into thinking its a really great thing and nothing out there is
as awesom as it. 

The prospect of sate is pretty simple

* have a known profile of data (a schema)
* be able to change the data (an action)
* be able to know from many different points what the state is (an update)

## Async is for losers

The last one is where React truly blows. After component "A" updates state there is a time where
it and only it knows that state has been changed but it hasn't broadcast; this is a model known as
"eventually consistent". That is maybe ok for say, an amazon order system, where an order can take a few
seconds/minutes, maybe in some context hours, to get fully registered --- but in a real time app 
eventually is too damn late. You should know instantly as soon as a change is made what the 
value is. 

Saga does allow for some reactivity and proper ordering of side effects, but its damn tough to read and debug. 

Most of the problem with debugging Redux is that is not a "thing" -- there is no redux class -- 
its a distributed federation of awful conventions scattered across way too many files. That makes summation
and coordination between multiple reducers difficult because only with Saga an one reducer know 
about another, and you have to do a LOT of work after every action to re-poll your multiple federated
states. 

In short there is no reason that state needs to be asynchronous at all. It doesn't benefit the
developer or the subscribers; it just allows for a lazy messaging and distribution system to 
not do the work of brodcasting until it feels like it. 

## Actions are a mess

The level of ritual that they wrap around encoding a method call in a sabot 
makes writing and reading Redux/Saga a chore. Calling a method shouldn't require any hand coding;
but because Redux has focused on treating the functional model as an unquestionable victory
means that you can't just go writing object methods and ironically, using functions without a bunch
of middleware and complex hard to read code.

## Part of the solution: RxJS

RxJS solves some of these problems. RxJS provides that level of immediacy; when I state/next a value, immediately all subscribers' update listeners
are called. However, there are some problems with a "way too immediate" model; it makes 
schema enforcement tough. Also, the fact that all emitters terminate on errors make "soft errors" 
a difficult thing to handle using react simply. 

## Even so, there is a cost for immediacy

Its easy to use streams for side effect of a change *after it has been registered*. its not as easy
to do interrupting pattens that sanitize or filter/reject bad data if your pattern is 'next/accept/broadcast'.
However, in Mirror there is a less final method; you can put changes through a pipeline in the form of a 
stream of updates that are themselves streams that either complete (and are accepted by the mirror) 
or are sent an error, which prevents the full execution of the action. 

## Mirroring with events

The event is divided into phases so that you can determine the order in which you listen/judge 
and filter the data. 

But regardless of all this "phase" detail, its still immediate and synchronous. 
If you send a change/action/message to a mirror, all the effects of that message 
are immediately resolved and the effects are available on the next line of code to inspect. 

in fact, the event itself is returned for each sent message, so you can see the error that did it in
if the message was not completed. You can also see if the event changed the value since your initial
transmission. 

### Premature termination of events

If you have an action "setName", you may want to intercept the signal of name updates and stop any updates
in which the name is set to a non-string value (array/number/object). You can actually do this with Sagas
but its extremely involved and requires extremely expert under-the-hood knowledge. 

Not so with Mirror. You only need to know some easily discovered facts about how it operates:

* all changes are accomplished by sending Events through the $events pipe. 
* You can listen to any event (specifically, ACTION_CHANGE_KEYS and ACTION_NEXT) via the `$on(action, hook)` method
* If you don't like the value of the name property in a change event you can 

1. reset it to its previous value (effectively no-op the change) 
2. filter it to a proper value (stringify?) 
3. cause the entire update to abort `event.error(new Error('bad name'))` and rollback that change and 
   potentially any associated update to stop execution
   
Note - with option 3 you do put the onus on the calling code to observe any signals that emit and 
take action when a bad data event occurs.

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

...And so on, you'd go apeshit. Because this asshole can't take a microstep without telling you about it. 
You don't want or need this data - you just want one signle notification when your car is fixed and ready
for you to pick it up. 

So how do you do that with Redux? You can't because the tempo of notification is trapped to the series
of atomic operations - actions. 

In Looking Glass Engine, Mirrors' predecessor, we had a tool known as *transactions* that let us muffle the
outward notifications during actions - this is a feature that will be shortly delivered, and will allow mirrors
to engage in any number of signal processes without notifying any subscribers until all notification locks have been 
removed. 

This means, for example you can write a "normalize" method for a 3d point that changes its magnitude to 1
and transactionally lock three discrete signals (setX, setY, setZ), then unlock activity once all sub-actions are 
complete and transmit one single update to all subscribers. 

# Scope of Use

Some stores are tactical and component scoped. For instance you have state and state control over a login form
that is not needed elsewhere in an application. Alternatively you may have a user scope with (amongst other things)
the identity of the logged in user that is needed nearly everywhere else. 

Right now we have one system (redux) that is optimized to sharing its content across the entire system;
even with reducers you still have one massive monolith; you can't have, say, a store that deals with 
sales tax and only load it if the user who logs in is in a sales tax state (most except Oregon AFAIK). 
You must load and enable your entire possible worlds states from jump or they will never be available 
anywhere. (* there may be a method of dynamic reducers but its certainly not widely available). 

MirrorCollections on the other hand are easily made to be dynamic. You can add - **and remove** - child 
mirrors to any collection *at any time* as often as you like and as long as the rest of the code
is aware of this dynamism you are fine. 

Also, you don't have to link all your mirrors; you can keep some mirrors in local scope doing local things,
and use whatever bridging code/technique you want to communicate values to other Mirrors if and when
its useful to do so. i.e., the login Mirror might need to know about the global User mirror, but not vice versa. 

## Not a knee-jerk React-ion

Part of the reason that Mirror has these abilities is that is was designed with React in mind -- 
but like RxJS it is not limited or dependant on React. It can be used with Preact, Vue, Angular or 
vanilla JavaScript as long as you write the proper bridge subscriptions between Mirrors and your
framework. The only requirement is that you unsubscribe all listeners when the recipient elements
go out of scope. 

## And it tests. 

Mirrors are classic objects and are fantastically easy to test; they don't require any DOM spinup
(in most use cases) and can be spawned from a factory function whenever you want. You can even 
inject things like fetch methods into those functions and easily stub out network calls in a test 
scenario. 

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

### I have the right to design compositionally

...And in my normal function I have the right to get and call my states' fields and other actions.
This also means I have the right to pause updates during complex operations to prevent unhelpful 
mid-process broadcast of my sub-actions. 

### I have the right to design my state in a single easy to read file

really. One file. And it should be straightforward and easy to read. 

### I have the right to test my state using any testing mechanic I want. 

I shouldn't have to create a complex DOM simulation to test a business logic element. 
