import { TodoCollection } from "./todoCollection";
import * as lowdb from "lowdb";
import * as FileSync from "lowdb/adapters/FileSync"
import { TodoItem } from "./todoItem";

type schemaType = {
    tasks: { id: number, task: string, complete: boolean; }[]
}

export class JsonTodoCollection extends TodoCollection {
    private database: lowdb.LowdbSync<schemaType>;

    constructor(public userName: string, todoItems: TodoItem[] = []) {
        super(userName, []);
        this.database = lowdb(new FileSync("Todos.json"));
        if (this.database.has("tasks").value()) {
            let dbitems = this.database.get("tasks").value();
            dbitems.forEach(item => {
                this.itemMap.set(item.id, new TodoItem(item.id, item.task, item.complete))
            });
        } else {
            this.database.set("tasks", todoItems).write();
            todoItems.forEach(item => this.itemMap.set(item.id, item));
        }
    }

    addTodo(task: string): number {
        let result = super.addTodo(task);
        this.storeTask();
        return result;
    }

    markComplete(id: number, complete: boolean): void {
        super.markComplete(id, complete);
        this.storeTask();
    }

    removeComplete() {
        super.removeComplete();
        this.storeTask();
    }

    private storeTask() {
        this.database.set("tasks", [...this.itemMap.values()]).write();
    }
}