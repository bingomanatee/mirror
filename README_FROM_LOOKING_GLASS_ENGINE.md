# @Wonderlandlabs/Mirror -- a reconsideration of Looking Glass Engine

This is a boiled-down version of Looking Glass Engine. It has most of the same concepts with 
(a) far fewer lines of code and (b) the ability to throw out a proxy version of the mirror that you can
get/set values from directly. 

LGE did what it wanted to well; however, it was fairly verbose and hard to read, and I thought I could
concentrate on the parts that worked well and leave out some of the more obscure and hard to read bits
and still have a good working system. 

## Dollar dollar bill yo

All the custom methods of Mirror have been prefixed with the dollar sign. This is so, in the proxied version,
you can use any un-dollar-signed property as a getter/setter and not worry about namespace conflicts

## One Map, One Way

There is only one class for "dictionary" type streams; where LGE had ValueMapStream and ValueObjectStream,
there is only MirrorCollection; you can seed it with an object OR a Map and it will produce the same sort 
of value. Note, internally, it uses a map as a store for efficiency but it reflects same form of data yuo 
pass in to its constructor. 

## Integrated actions

Actions are no longer managed with an external modifier. They are in fact hooks for events, but unlike
other $send-based operations they will throw if the event errors out. 

## Simpler event phasing

Event phases are numeric - currently, PHASE_PRE(-1), PHASE_ON(0) and PHASE_POST. 

## re-branding "field subjects" as "children"

the field subject terminology was a real stinker; they have been replaced with the far more universal
concept of "children"; a MirrorCollection has child Mirrors/MirrorCollections that in the reducer pattern,
feed into a key of its value. 

## a holistic proxy

Where LGE had `.my` and `.do` proxies to its values and actions (respectively) Mirror has a single 
proxy, `.$p` that has all its fields and methods exposed as a flat object. 

for backwards compatibility, my is also provided as a synonym for $p;
# Pending work

A few features have dropped off the table from LGE:

* **custom phases** will be added -- not sure how soon
* **auto-nested mirrors**: this is part of the inspiration for the reboot in the first place: 
  at some point, perhaps as a configuration option, mirrors will auto-decompose passed-through 
  objects and maps as MirrorCollections.(1)
* **filter, finalize**: these shortcut inroads to the event system will be added at a later
  date - in practice I didn't personally use/like them much but they do make sense.
  
____

(1)  Currently the MirrorCollection is a "flat" system;
you cannot easily define deep Collection trees (or rather, you can, but its not been tested yet :D);
hopefully in the future it will be an automatic result of adding complex children.
This will have the effect of "semi-immutable" children in which changing a property of a
child object/map will create a brand new object/map in the heirarchy.
