import Footer from "@/components/sections/footer";
import Header from "@/components/sections/header";
import { BorderBeam } from "@/components/magicui/border-beam";
import { CustomerServiceForm } from "@/components/marketing/customer-service-form";

export default function CustomerServicePage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Kundeservice
              </h1>
              <p className="text-xl text-muted-foreground">
                Trenger du hjelp? Send oss en melding, så svarer vi så fort vi
                kan.
              </p>
            </div>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Rask responstid
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Personlig oppfølging
              </li>
              <li className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Profesjonell support
              </li>
            </ul>
          </div>

          {/* Right side - Contact form */}
          <div className="relative">
            <BorderBeam className="absolute inset-0 opacity-40" />
            <div className="relative bg-background/80 backdrop-blur-xl rounded-lg border shadow-lg p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  Send oss en melding
                </h2>
                <p className="text-muted-foreground">
                  Vi svarer normalt innen 24 timer
                </p>
              </div>
              <CustomerServiceForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
