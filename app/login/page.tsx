"use client";


import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function LoginPage(){

const supabase = createClient();

const router = useRouter();


const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [error,setError] = useState("");



async function login(){


const {error} = await supabase.auth.signInWithPassword({

email,

password

});


if(error){

setError(error.message);

return;

}


router.push("/");


}



return (

<div className="flex min-h-screen items-center justify-center bg-slate-100">


<div className="w-full max-w-md rounded-xl bg-white p-8 shadow">


<h1 className="mb-6 text-3xl font-bold">
InventoryPro
</h1>


<input

className="mb-3 w-full rounded border p-3"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>


<input

className="mb-3 w-full rounded border p-3"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>


<button

onClick={login}

className="w-full rounded bg-blue-600 p-3 text-white"

>

Ingresar

</button>

<p className="mt-4 text-center text-sm text-slate-600">
¿Aún no tienes cuenta?{' '}
<Link href="/register" className="font-medium text-blue-600 hover:underline">
Crear una cuenta
</Link>
</p>


{
error &&
<p className="mt-3 text-red-500">
{error}
</p>
}


</div>


</div>

)


}
