"use client";

import { useEffect, useState } from "react";
import { getMyEditorOrders } from "@/app/actions/editor/get-my-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { EditorSetup } from "./editor-setup";

interface Order {
  id: string;
  orderDate: Date;
  location: string;
  status: string;
  workspace: {
    name: string;
  };
  photographer: {
    name: string | null;
  };
  checklist: {
    dropboxUrl: string | null;
  };
  EditorChecklist: {
    reviewUrl: string | null;
  };
}

export function MyEditorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await getMyEditorOrders();
        if (response.success) {
          setOrders(response.data);
        } else {
          setError(response.error);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch orders"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (error === "Editor profile not found") {
    return <EditorSetup userId="your-user-id" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ingen aktive oppdrag</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Du har ingen oppdrag under arbeid for øyeblikket.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {order.workspace.name}
              </CardTitle>
              <Badge variant="outline">{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fotograf</span>
                  <span>{order.photographer?.name || "Ikke tildelt"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lokasjon</span>
                  <span>{order.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dato</span>
                  <span>
                    {format(new Date(order.orderDate), "PPP", {
                      locale: nb,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {order.checklist?.dropboxUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={order.checklist.dropboxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Åpne i Dropbox
                    </a>
                  </Button>
                )}
                <Button asChild>
                  <Link href={`/editor/ordre/${order.id}`}>Se detaljer</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
