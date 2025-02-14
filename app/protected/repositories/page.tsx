import RoadFooter from "@/app/components/RoadFooter";
import ProjectSelector from "../../components/project-selector";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.provider_token;
  if (!accessToken) {
    supabase.auth.signOut();
    redirect("/sign-in");
  }

  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  console.log("Default URL", defaultUrl);
  console.log("User", user);
  console.log("Access Token", accessToken);
  const response = await fetch(`${defaultUrl}/api/getAllRepos`, {
    method: "POST",
    body: JSON.stringify({
      githubToken: accessToken,
      githubUsername: user?.user_metadata.user_name,
    }),
  });
  console.log("Response", response);
  const gitProjects = await response.json();
  console.log("Git Projects", gitProjects);

  return (
    <main className="min-h-screen bg-[#808080] flex flex-col items-center">
      <ProjectSelector repos={gitProjects?.data?.user?.repositories?.nodes} />
      <RoadFooter />
    </main>
  );
}
