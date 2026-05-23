import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscribeForm from "../components/SubscribeForm";
import PublishForm from "../components/PublishForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Article Notifications
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Subscribe to your favorite authors and get notified the moment they
            publish something new.
          </p>
        </div>

        <Tabs defaultValue="subscribe">
          <TabsList className="w-full mb-4 bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="subscribe"
              className="flex-1 text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-zinc-800"
            >
              Subscribe
            </TabsTrigger>
            <TabsTrigger
              value="publish"
              className="flex-1 text-zinc-400 data-[state=active]:text-white data-[state=active]:bg-zinc-800"
            >
              Simulate Publish
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscribe">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <SubscribeForm />
            </div>
          </TabsContent>

          <TabsContent value="publish">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
              <PublishForm />
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center  mt-6">
          You can unsubscribe anytime from the email.
        </p>
      </div>
    </main>
  );
}
