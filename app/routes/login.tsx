import { type ActionFunctionArgs, Form, redirect } from "react-router";
import { createClient } from "~/utils/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");

  const { supabase } = createClient(request);

  await supabase.auth.signInWithOtp({
    email: email as string,
  });

  return redirect("/auth/mail-sent");
}

export default function Login() {
  return (
    <main className="pt-16 p-4 container mx-auto h-full align-middle justify-center flex">
      <Form method="post">
        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
          <legend className="fieldset-legend text-xl">Login</legend>

          <label className="label">Email</label>
          <input
            type="email"
            name="email"
            className="input validator"
            required
            placeholder="you@site.com"
          />

          <button className="btn btn-neutral mt-4">Login</button>
          <span className="text-sm text-gray-500 mt-4">
            Signups are disabled for now!
          </span>
        </fieldset>
      </Form>
    </main>
  );
}
