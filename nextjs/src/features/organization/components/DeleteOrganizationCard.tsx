// components/organization/delete-organization-card.tsx
import { Trash2 } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeleteOrganizationCardProps {
  title?: string;
  description?: string;
  count?: number;
  isDisabled?: boolean;
  onDeleteClick: () => void;
}

export function DeleteOrganizationCard({
  title,
  description,
  count,
  isDisabled = false,
  onDeleteClick
}: DeleteOrganizationCardProps) {
  const isButtonDisabled = isDisabled || count === 0;
  
  return (
    <Card className={isDisabled ? "opacity-75" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          
          <Button 
            variant="destructive" 
            size="icon"
            onClick={onDeleteClick}
            disabled={isButtonDisabled}
            className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {count !== undefined && (
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground mr-2">Total:</span>
            <Badge variant="secondary">{count}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}