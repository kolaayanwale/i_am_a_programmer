import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useState } from "react";
import SubjectDetailModal from "./subject-detail-modal";

interface SubjectCardProps {
  subject: {
    id: number;
    name: string;
    relationship?: string;
    profileImageUrl?: string;
    status: string;
    email?: string;
    phone?: string;
    birthday?: string;
  };
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'paused':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      default:
        return 'Inactive';
    }
  };

  return (
    <>
      <div 
        className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-card"
        onClick={() => setIsDetailModalOpen(true)}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {subject.profileImageUrl ? (
              <img 
                src={subject.profileImageUrl} 
                alt={subject.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{subject.name}</h4>
            <p className="text-sm text-muted-foreground">{subject.relationship || 'No relationship set'}</p>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${
              subject.status === 'active' ? 'bg-green-400' : 
              subject.status === 'paused' ? 'bg-amber-400' : 'bg-gray-400'
            }`}></span>
            <span className="text-xs text-muted-foreground">{getStatusText(subject.status)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Next: {subject.birthday ? 'Birthday' : 'No notifications'}</span>
          <div className="flex space-x-1">
            {subject.email && (
              <Badge variant="secondary" className="text-xs">
                Email
              </Badge>
            )}
            {subject.phone && (
              <Badge variant="secondary" className="text-xs">
                SMS
              </Badge>
            )}
          </div>
        </div>
      </div>

      <SubjectDetailModal
        subject={subject}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
}
