# Mirror

Mirror creates subscribable objects. This README will be expanded on
more completely after Mirror has advanced out of Alpha. At this moment
Mirror is still under heavy development 
and is decidedly ***NOT ready for use in production***

## Mirrors

Mirrors are nestable BehaviorSubjects; they can trace a single value of any type,
or a nested series of child values in Map or Object format. 

A Mirror is designed to allow validation -- that is -- invalid formats are banned from submission.

Also, Mirrors have a transactional update cycle, in which a variety of child values and sub-values
can be updated in a single update cycle. 

### Mirror type

A Mirror infers type based on its initial value. If it's a TYPE_MAP or TYPE_OBJECT then child fields
are stored in $children Mirrors; this can in fact recurse as deeply as you want. 

TYPE_VALUE mirrors on the other hand have no children - the value of the Mirror is a single item,
with zero assumptions as to what it is (even undefined; dates; class instances; dom nodes or whatever).

Currently, variations include:

* TYPE_MAP: A Map based collection
* TYPE_OBJECT: a pojo object
* TYPE_VALUE: a single item

note - type affects whether the Mirror is a single value manipulator or whether children are tracked
as child Mirrors. With explicit configurations any value -- including objects or Map instances --
can be treated as a Value. 

### Immer and Mirror

The value of a TYPE_OBJECT or TYPE_MAP is made immutable via Immer. 

## Actions

@TODO
