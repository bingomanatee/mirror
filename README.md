# Mirror

Mirror creates subscribable objects. This README will be expanded on
more completely after Mirror has advanced out of Alpha. At this moment
Mirror is still under heavy development 
and is decidedly ***NOT ready for use in production***

## Mirrors

Mirrors are nestable BehaviorSubjects; they can trace a single value of any type,
or a nested series of child values in Map or Object format. 

A Mirror is designed to allow validation -- that is -- invalid formats are banned from submission and 
do not trigger subscriber notifications (or crash the subject). 

Also, Mirrors have a transactional update cycle, in which a variety of child values and sub-values
can be updated in a single update cycle. This allows the mirrors and any child mirrors to be
validated before subscription notifications occur. 

Mirrors follow the following mandates; they are:

* **synchronous** -- all updates happen inline, allowing for immediate post-inspection
* **structured** -- you can define strict schema for mirrors and mirror fields, rejecting bad values.
* **observable** -- Mirrors are and follow the RXJS patterns of Observation; in fact, they are BehaviorSubjects.
* **testable** -- as an object with testable properties, they can easily be tested free from any view scaffolding. 
* **independent** -- because they don't bind themselves to any one view framework, they can be used and are future proofed against any changes in client systems.

These traits allow for a strong, managed state experience in any context from React to Angular and even 
node, bare-metal design or any other context. 

### Mirror type

A Mirror infers type based on its initial value. If it's a collection type (TYPE_MAP or TYPE_OBJECT)
it allows for child keyed values to be managed by child sub-mirrors; so you can create trees of mirrors
to produce and manage complex types. note - even in collections children are _optional_ - 
you can store collections wholly within the root value, you just have the ability 
to manage them through child mirrors as well. 

TYPE_VALUE mirrors have no children - the value of the Mirror is a single item,
with zero assumptions as to what it is (even undefined; dates; class instances; dom nodes or whatever).

Currently, variations include:

* TYPE_MAP: A Map based collection
* TYPE_OBJECT: a pojo object
* TYPE_VALUE: a single item

note - type affects whether the Mirror is a single value manipulator or whether children are tracked
as child Mirrors. With explicit configurations any value -- including objects or Map instances --
can be treated as a Value. 

### Validation

The short version-if you include a {test: (nextValue) => error(s) || false} configuration
in your mirror, it will silently reject values that emit/return errors from the test function

every time a Mirror's value is updated (via next(nextValue)), 
an event queue allows for its $test function to be ran on the pending value. 
If that function (exists and) returns / throws errors, 
then the submitted value is silently rejected and no observed notification occurs. 

If the next value contains keys of managed children, those children are passed trial values
and tested. Any errors in a pending child value are treated as errors in the root and 
both the parent and child values are flushed silently. 

If the child values are good, they are committed, notifying any direct subscribers;
then the parent is committed, notifying its subscribers of their updates. 

This careful cycle allows for fine-grained control of values and minimizes the possibility
of vad values leaking through the system; "bad" is about more than base type (string, array, etc);
it is also about any business logic lockins (range, character count) you wish to enforce. 

### Immer and Mirror

The value of a TYPE_OBJECT or TYPE_MAP is made immutable via Immer. 

### Additive updating

Like setState in (old school) React, for collections, 
next(nextValue) adds or updates keys. There is no way to next() - update values and end up
with an object/map with fewer keys than you used to have. 
Any value sent through next to a collection changes the subset of keys present in it, in the value,
or updates the $children's values, which has the same effect.

If you want to explicitly delete a current keyed value, you must call `mirror.$delete(name)`. 

## Actions

@TODO

## And lastly -- what is with all the dollar signs?

As Mirrors extend BehaviorSubjects, in order to minimize the possibility
of overlap between Mirror code and anything up the inheritance chain from
RXJS, all properties and methods of mirrors are prefixed with dollar signs. 
