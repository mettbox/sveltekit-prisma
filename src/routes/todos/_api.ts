import type { Locals, Todo } from '$lib/types'
import PrismaClient from '$lib/prisma'

/*
  This module is used by the /todos endpoint. The leading underscore indicates 
  that this is a private module, _not_ an endpoint — visiting /todos/_api
  will net you a 404 response.
*/

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

  return {
    status,
    body
  }
}
