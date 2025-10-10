import Link from "next/link";

import { Home, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export default async function Unauthorized({ searchParams }: Props) {
  const { page, message } = await searchParams;

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Card className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Access Denied
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              You don&apos;t have the necessary permissions to access{" "}
              <span className={page ? "font-bold" : ""}>
                {page || "this page."}{" "}
              </span>
              <br />
              Please contact an administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button
                variant="outline"
                asChild
                className="w-full !bg-primary/20 text-primary">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>{" "}
              <BackButton />
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Wrong Account?
                </span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Error Code:{" "}
                <span className="font-mono text-foreground">403</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
