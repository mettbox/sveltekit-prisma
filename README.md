# SvelteKit and Prisma

> Learn how to use Prisma to persist data in your sveltekit application.

We are going to start with a default [SvelteKit](https://kit.svelte.dev/) 
application, install and configure [Prisma](https://www.prisma.io/) before we 
will use the PrismaClient to perform CRUD actions with a MySQL database.

## SvelteKit demo app

```sh
$ npm init svelte@next myapp
✔ Which Svelte app template? › SvelteKit demo app
✔ Use TypeScript? › Yes
✔ Add ESLint for code linting? › Yes
✔ Add Prettier for code formatting? › Yes

$ cd myapp
$ yarn
$ git init && git add -A && git commit -m "Initial commit"
```

Start a development server:

```bash
yarn run dev

# or start the server and open the app in a new browser tab
yarn run dev -- --open
```

Look around in the SvelteKit demo app. Then you'll understand better what will
be adjusted right away and what can be used further.

## Install Prisma

```sh
$ yarn add --dev prisma
$ npx prisma init
``` 

Set the DATABASE_URL in the `.env` file.

```
# ./.env
DATABASE_URL="mysql://janedoe:mypassword@localhost:3306/mydb"
```

My database is located at [Uberspace](https://manual.uberspace.de/database-mysql/) 
and is remotely accessible only through an SSH tunnel.

```
ssh -L 3306:127.0.0.1:3306 myuser@xy.uberspace.de
```

Set the provider of the datasource:

```
# ./prisma/schema.prisma
datasource db {
  provider = "mysql"
  url = env("DATABASE_URL")
}
```

Generate the Prisma Client:

```sh
$ npx prisma generate
```

We now store the generated code snippet in the `lib` folder to make the Prisma 
client available for our Todo API.

```ts
# src/lib/prisma.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default PrismaClient
```

## Create the database and tables

Define the Todo model:

```
# ./prisma/schema.prisma
model Todo {
  uid        String  @id @default(cuid())
  created_at DateTime
  text       String
  done       Boolean
}
```

Push the Prisma schema state to the database. You can then start querying.

```sh
$ npx prisma db push
```

## Implement CRUD actions

The SvelteKit demo app encapsulates all API features in the 
`src/routes/todos/_api.ts` file. We are going to modify the file to deal with 
CRUD using the PrismaClient.

```ts
// src/routes/todos/_api.ts

import type { Locals, Todo } from '$lib/types'
import PrismaClient from '$lib/prisma'

const prisma = new PrismaClient()

export async function api(method: string, resource: string, data?: Record<string, unknown>) {
  let body = {}
  let status = 500

  switch (method.toUpperCase()) {
    case 'DELETE':
      await prisma.todo.delete({
        where: {
          uid: resource.split('/').pop()
        }
      })
      status = 200
      break
    case 'GET':
      body = await prisma.todo.findMany()
      status = 200
      break
    case 'PATCH':
      body = await prisma.todo.update({
        data: {
          done: data.done,
          text: data.text
        },
        where: {
          uid: resource.split('/').pop()
        }
      })
      status = 200
      break
    case 'POST':
      body = await prisma.todo.create({
        data: {
          created_at: new Date(),
          done: false,
          text: data.text
        }
      })
      status = 201
      break
  }

  // If the request came from a <form> submission, the browser's default
  // behaviour is to show the URL corresponding to the form's "action"
  // attribute. In those cases, we want to redirect them back to the
  // /todos page
  if (method.toUpperCase() !== 'GET') {
    return {
      status: 303,
      headers: {
        location: '/todos'
      }
    }
  }

  return { status, body }
}
```

The API output has now changed a bit compared to the fetch request of the 
original demo app. The following code block must therefore be adjusted:

```ts
// src/routes/todos/index.ts
...
if (response.status === 200) {
  return {
    body: {
      todos: await response.json() // <- replace this
      todos: await response.body // <- with this
    }
  };
}
```

## Building

Before you can create a production version of your SvelteKit app, you need to 
adapt it for your deployment target. 
See [Adapters](https://kit.svelte.dev/docs/adapters).

Let's try it with a simple node server:

```sh 
$ yarn add --dev @sveltejs/adapter-node@next
```

```js
// svelte.config.js

import adapter from '@sveltejs/adapter-auto'  // <- replace this
import adapter from '@sveltejs/adapter-node'// <- with this
```

To create a production version of your app:

```bash
yarn run build
```

You can preview the production build:

```sh
$ yarn run preview
```

Run production build:

```sh
$ node build
```

Done :-)
