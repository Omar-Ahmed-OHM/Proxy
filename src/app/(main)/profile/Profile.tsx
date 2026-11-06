"use client";

import { CircleAlert, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { Button, Card, EmptyState, PageHeader, Skeleton } from "@/app/components/ui";
import { DangerZone } from "./components/DangerZone";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileSummary } from "./components/ProfileSummary";
import { useCurrentUser } from "./hooks/useCurrentUser";

export default function Profile() {
  const { data: user, isPending, isError, refetch } = useCurrentUser();

  return (
    <>
      <PageHeader title="Profile" description="Manage your account details and security." />

      {isPending ? (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <Card>
            <div className="flex flex-col items-center gap-4">
              <Skeleton variant="avatar" className="size-16" />
              <Skeleton variant="text" width="50%" />
              <Skeleton variant="text" width="70%" />
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <Skeleton variant="text" count={4} />
          </Card>
        </div>
      ) : isError || !user ? (
        <Card>
          <EmptyState
            icon={<CircleAlert aria-hidden="true" />}
            title="Couldn’t load your profile"
            description="Check your connection and try again."
            primaryAction={
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-3">
          <Card variant="elevated" className="lg:sticky lg:top-24">
            <ProfileSummary user={user} />
          </Card>

          <div className="flex min-w-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
            <Card
              title="Personal information"
              description="Update your name and timezone."
              icon={<UserRound aria-hidden="true" />}
            >
              <ProfileForm key={user.updatedAt} user={user} />
            </Card>

            <Card
              title="Password"
              description="Use a strong password you don't use anywhere else."
              icon={<ShieldCheck aria-hidden="true" />}
            >
              <PasswordForm />
            </Card>

            <Card
              title="Danger zone"
              icon={<ShieldAlert aria-hidden="true" />}
              className="border-danger/30"
            >
              <DangerZone />
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
