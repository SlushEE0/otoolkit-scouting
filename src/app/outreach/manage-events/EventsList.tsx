import { toast } from "sonner";
import { pb } from "@/lib/pbaseClient";
import type { t_pb_OutreachEvent } from "@/lib/types";
import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogHoursDialog from "./LogHoursDialog";
import Loader from "@/components/Loader";

interface EventsListProps {
  events: t_pb_OutreachEvent[] | undefined;
  selectedEvent: t_pb_OutreachEvent | null;
  onEventSelect: (event: t_pb_OutreachEvent) => void;
  onEventDeleted: () => void;
  onHoursLogged: () => void;
  isMobile?: boolean;
}

export default function EventsList({
  events,
  selectedEvent,
  onEventSelect,
  onEventDeleted,
  onHoursLogged,
  isMobile = false
}: EventsListProps) {
  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This will also delete all associated sessions."
      )
    ) {
      return;
    }

    try {
      await pb.collection("OutreachEvents").delete(eventId);
      toast.success("Event deleted successfully");
      onEventDeleted();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={isMobile ? "h-[300px]" : "h-[500px]"}>
          {!events ? (
            <div className="flex items-center justify-center py-8">
              <Loader />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events created yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => onEventSelect(event)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <LogHoursDialog
                        event={event}
                        onHoursLogged={onHoursLogged}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
