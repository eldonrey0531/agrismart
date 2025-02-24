'use client';

import { Icons } from '@/components/ui/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ButtonWrapper } from '@/components/ui/button-wrapper';
import { cn } from '@/lib/utils';

const mockTeamMembers = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Farm Manager',
    status: 'active',
    email: 'john.smith@example.com',
    avatar: null,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Field Supervisor',
    status: 'active',
    email: 'maria.garcia@example.com',
    avatar: null,
  },
  {
    id: '3',
    name: 'David Chen',
    role: 'Agricultural Technician',
    status: 'offline',
    email: 'david.chen@example.com',
    avatar: null,
  },
];

const mockRoles = [
  {
    name: 'Farm Manager',
    description: 'Full access to all farm management features',
    members: 1,
  },
  {
    name: 'Field Supervisor',
    description: 'Can manage field operations and workers',
    members: 2,
  },
  {
    name: 'Agricultural Technician',
    description: 'Access to technical tools and data',
    members: 3,
  },
];

export default function TeamPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
        <ButtonWrapper variant="default">
          <Icons.add className="mr-2 h-4 w-4" />
          Add Member
        </ButtonWrapper>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icons.user className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex h-2 w-2 rounded-full",
                    member.status === 'active' ? "bg-green-500" : "bg-gray-300"
                  )} />
                  <ButtonWrapper variant="outline" size="sm">
                    <Icons.settings className="mr-2 h-4 w-4" />
                    Manage
                  </ButtonWrapper>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Manage team roles and access levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRoles.map((role) => (
                <div
                  key={role.name}
                  className="rounded-lg border p-4"
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{role.name}</h4>
                    <span className="text-sm text-muted-foreground">
                      {role.members} members
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {role.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              Track and manage team invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Icons.info className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No pending invitations
              </p>
              <ButtonWrapper variant="outline" className="mt-4">
                <Icons.add className="mr-2 h-4 w-4" />
                Send Invitation
              </ButtonWrapper>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}