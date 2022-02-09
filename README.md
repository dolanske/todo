### TODO application in CLI

I was bored and decided to try my luck with command line interface. This is the first of the two projects I have planned on this endeavour. A very simple CLI.

```console

./todo.js <command>

available commands:

    new       <track>     used to create a new todo, if track parameter is set to true,
                          tracking begins immediately
    get       <index>     used to retrieve your todos, if index is provided,
                          returns todo at the index
    del       <index>     used to delete todo at provided index
    complete  <index>     used to mark a todo as complete
    track     <index>     used to track how long it took to complete task
    help                  used to print the usage guide

```
