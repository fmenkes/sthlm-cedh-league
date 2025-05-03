import { type ActionFunctionArgs, Form } from "react-router";
import { createClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  const { supabase } = createClient(request);

  await supabase.auth.signInWithOtp({
    email: email as string,
    options: {
      emailRedirectTo: `http://localhost:3000/`,
    },
  });
}

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <Form method="post">
        <input type="email" name="email" placeholder="Email" />
        <button type="submit">Login</button>
      </Form>
    </div>
  );
}
