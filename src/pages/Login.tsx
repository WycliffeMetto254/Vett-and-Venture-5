import React from "react";
import Layout from "../../components/Layout";

const Login = () => {
  return (
    <Layout>
      <h2 className="text-xl mb-4">Login</h2>
      <form className="flex flex-col gap-2 max-w-sm">
        <input type="email" placeholder="Email" className="border p-2" />
        <input type="password" placeholder="Password" className="border p-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
          Login
        </button>
      </form>
    </Layout>
  );
};

export default Login;
