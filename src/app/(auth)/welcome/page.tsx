"use client";

import { useSignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * TODO: Complete User Invitation Flow
 * 1. Fix Clerk invitation handling - current approach with signUp.create({ invitationToken }) doesn't match Clerk's API
 * 2. Implement proper invitation acceptance flow using Clerk's recommended approach
 * 3. Add loading states and error handling in the UI
 * 4. Create proper onboarding steps:
 *    - Password creation
 *    - Profile completion
 *    - Workspace role acknowledgment
 * 5. Add proper routing after successful signup:
 *    - Redirect to dashboard or specific workspace
 *    - Handle different roles (admin, photographer, editor)
 * 6. Add proper error states and recovery flows
 * 7. Consider adding email verification status check
 */

export default function WelcomePage() {
  const { signUp, setActive } = useSignUp();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("__clerk_invitation_token");

  useEffect(() => {
    if (invitationToken && signUp) {
      // Handle the invitation acceptance and account creation
      const handleInvitation = async () => {
        try {
          await signUp.create({
            invitationToken,
          });

          // After signup, update the user ID in our database
          // You'll need to create this server action
          await updateUserClerkId({
            tempUserId: signUp.publicMetadata.tempUserId as string,
            clerkUserId: signUp.createdUserId as string,
          });

          await setActive({ session: signUp.createdSessionId });
        } catch (err) {
          console.error("Error accepting invitation:", err);
        }
      };

      handleInvitation();
    }
  }, [invitationToken, signUp, setActive]);

  return (
    <div>
      <h1>Welcome to Fotovibe</h1>
      <p>Setting up your account...</p>
    </div>
  );
}
