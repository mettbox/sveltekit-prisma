/**
 * Can be made globally available by placing this
 * inside `global.d.ts` and removing `export` keyword
 */
export interface Locals {
	userid: string;
}

export type Todo = {
	uid: string;
	created_at: Date;
	text: string;
	done: boolean;
};
