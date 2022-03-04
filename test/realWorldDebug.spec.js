const tap = require('tap');
const watch = require('../watch');

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test('real-world-issues', (rw) => {
    rw.test('dynamic children', (dc) => {
      const mir = new Subject(
        {
          status: 'foo',
        },
        {
          mutable: true,
          children: {
            tasks: new Subject(new Map(), { mutable: true }),

          },
          actions: {
            startAllTasks(m) {
              const taskChild = m.$children.get('tasks');
              taskChild.value.forEach((value, i) => {
                const taskInnerChild = taskChild.$children.get(i);
                taskInnerChild.$do.setStatus('started');
              });
            },
            addTask(m, name) {
              const taskChild = m.$children.get('tasks');
              taskChild.$addChild(taskChild.value.size, new Subject({ status: 'pending', name }, { name }));
            },
          },
        },
      );

      mir.$do.addTask('foo');
      mir.$do.addTask('bar');

      dc.same(mir.value.tasks.get(0).name, 'foo');
      dc.same(mir.value.tasks.get(1).name, 'bar');

      mir.$do.startAllTasks();

      dc.same(mir.value.tasks.get(0).status, 'started');
      dc.same(mir.value.tasks.get(1).status, 'started');
      dc.end();
    });

    rw.end();
  });

  suite.end();
});
