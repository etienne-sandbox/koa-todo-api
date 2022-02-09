import Koa from "koa";
import errorHandler from "koa-error";
import bodyparser from "koa-bodyparser";
import Router from "@koa/router";
import * as z from "zod";
import { nanoid } from "nanoid";
import httpErrors from "http-errors";
import cors from "@koa/cors";

const TODOS = [
  { id: "qr0u1q1", name: "Learn JS", done: true },
  { id: "jt0v1bu", name: "Learn React", done: true },
  { id: "5e0x1bt", name: "Learn JSX", done: false },
  { id: "on0z1fl", name: "Rule the world", done: false },
];

const app = new Koa();

app.use(cors());
app.use(errorHandler({ accepts: ["json"] }));
app.use(bodyparser({ enableTypes: ["json"] }));

const router = Router();

router.get("/", async (ctx) => {
  ctx.body = { you: "<- are here !" };
});

router.get("/todos", async (ctx) => {
  ctx.body = TODOS;
});

const PostTodoBody = z.object({
  name: z.string().min(3),
  done: z.boolean().optional(),
});

router.post("/todo", async (ctx) => {
  const parsed = PostTodoBody.safeParse(ctx.request.body);
  if (parsed.success === false) {
    throw new httpErrors.BadRequest(`Invalid body`);
  }
  const { name, done = false } = parsed.data;
  const newTodo = {
    id: nanoid(7),
    name,
    done,
  };
  TODOS.push(newTodo);
  ctx.body = newTodo;
});

const PutTodoBody = z.object({
  name: z.string().min(3).optional(),
  done: z.boolean().optional(),
});

router.put("/todo/:todoId", async (ctx) => {
  const parsed = PutTodoBody.safeParse(ctx.request.body);
  if (parsed.success === false) {
    throw new httpErrors.BadRequest(`Invalid body`);
  }
  const todo = TODOS.find((todo) => todo.id === ctx.params.todoId);
  if (!todo) {
    throw new httpErrors.NotFound(`Todo not found`);
  }
  console.log(parsed.data);
  if (parsed.data.name) {
    todo.name = parsed.data.name;
  }
  if (parsed.data.done !== undefined) {
    todo.done = parsed.data.done;
  }
  ctx.body = todo;
});

router.delete("/todo/:todoId", async (ctx) => {
  const todo = TODOS.find((todo) => todo.id === ctx.params.todoId);
  if (!todo) {
    throw new httpErrors.NotFound(`Todo not found`);
  }
  TODOS.splice(TODOS.indexOf(todo), 1);
  ctx.body = null;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3001, () => {
  console.log(`Server is up on http://localhost:3001`);
});
