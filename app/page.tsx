import prisma from '@/lib/prisma';

import { currentUser } from '@clerk/nextjs';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

const Home = async () => {
  const posts = await prisma.posts.findMany();

  const user = await currentUser();

  if (!user) {
    return (
      <>
        <Link href="/sign-up">
          <button>Create Your Account</button>
        </Link>
        <Link href="/sign-in">
          <button>Sign In</button>
        </Link>
      </>
    );
  }

  const handlePost = async (data: FormData) => {
    'use server';
    await prisma.posts.create({
      data: {
        userId: user.id,
        imageUrl: user.imageUrl,
        content: data.get('content') as string,
      },
    });
    revalidatePath('/posts');
  };

  const handleDelete = async (data: FormData) => {
    'use server';
    await prisma.posts.delete({
      where: {
        id: Number(data.get('id')),
      },
    });
    revalidatePath('/posts');
  };

  return (
    <div>
      <ul>
        {posts.map((p) => {
          return (
            <li key={p.id + 'content'}>
              <form action={handleDelete}>
                <span>{p.content}</span>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit">Delete</button>
              </form>
            </li>
          );
        })}
      </ul>
      <form action={handlePost}>
        <label htmlFor="content">Content</label>
        <input name="content" />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default Home;
