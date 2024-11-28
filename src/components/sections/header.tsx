"use client";

import Drawer from "@/components/drawer";
import { Icons } from "@/components/icons";
import Menu from "@/components/menu";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserButton, useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { createNewUser } from "@/app/actions/user/create-new-user";
import { UserRole } from "@/lib/types";

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Handle scroll effect for border
  useEffect(() => {
    const handleScroll = () => {
      setAddBorder(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle user creation after sign in
  useEffect(() => {
    async function handleUserCreation() {
      if (isSignedIn) {
        try {
          const user = await createNewUser();
          if (!user) {
            console.error("Failed to create user in database");
          }
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    }

    if (isLoaded) {
      handleUserCreation();
    }
  }, [isSignedIn, isLoaded]);

  return (
    <header
      className={
        "relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur"
      }
    >
      <div className="flex justify-between items-center container">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2"
        >
          <Icons.logo className="w-auto h-[40px]" />
          <span className="font-bold text-xl">{siteConfig.name}</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Menu />
          </div>

          <nav className="flex items-center space-x-2">
            {isLoaded ? (
              isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Dashboard
                  </Link>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Logg inn
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className={buttonVariants({
                        size: "sm",
                      })}
                    >
                      Ta kontakt
                    </button>
                  </SignUpButton>
                </>
              )
            ) : (
              // Loading state
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            )}
          </nav>
        </div>

        <div className="md:hidden">
          <Drawer />
        </div>
      </div>
      <hr
        className={cn(
          "absolute bottom-0 w-full transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}
