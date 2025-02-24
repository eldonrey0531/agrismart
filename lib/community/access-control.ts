import { type UserRole } from '@/lib/auth/roles';

/**
 * Community action types
 */
export type CommunityAction = 
  | 'view_content'
  | 'create_post'
  | 'update_post'
  | 'delete_post'
  | 'create_comment'
  | 'update_comment'
  | 'delete_comment'
  | 'moderate_content'
  | 'pin_post'
  | 'report_content';

/**
 * Content type definition
 */
export type ContentType = 'post' | 'comment' | 'reply';

/**
 * Content moderation status
 */
export type ModerationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'flagged'
  | 'removed';

/**
 * Role-based permission configuration
 */
const communityPermissions: Record<UserRole, CommunityAction[]> = {
  guest: [
    'view_content',
    'report_content'
  ],
  buyer: [
    'view_content',
    'create_post',
    'update_post',
    'delete_post',
    'create_comment',
    'update_comment',
    'delete_comment',
    'report_content'
  ],
  seller: [
    'view_content',
    'create_post',
    'update_post',
    'delete_post',
    'create_comment',
    'update_comment',
    'delete_comment',
    'report_content'
  ],
  admin: [
    'view_content',
    'create_post',
    'update_post',
    'delete_post',
    'create_comment',
    'update_comment',
    'delete_comment',
    'moderate_content',
    'pin_post',
    'report_content'
  ]
};

/**
 * Check if user has permission for a community action
 */
export function hasCommunityPermission(
  role: UserRole,
  action: CommunityAction
): boolean {
  return communityPermissions[role]?.includes(action) || role === 'admin';
}

/**
 * Check if user can manage specific content
 */
export function canManageContent(
  role: UserRole,
  contentOwnerId: string,
  userId: string,
  contentType: ContentType
): boolean {
  // Admins can manage all content
  if (role === 'admin') return true;
  
  // Users can manage their own content
  if (contentOwnerId === userId) return true;
  
  // Otherwise, no management permissions
  return false;
}

/**
 * Check if content needs moderation
 */
export function needsModeration(
  role: UserRole,
  contentType: ContentType
): boolean {
  // Guest content always needs moderation
  if (role === 'guest') return true;
  
  // Posts need moderation for new users
  if (contentType === 'post') {
    return true; // You can add more complex logic here
  }
  
  return false;
}

/**
 * Get moderation settings for content
 */
export function getModerationSettings(
  role: UserRole,
  contentType: ContentType
) {
  return {
    autoApprove: role !== 'guest',
    requiresReview: needsModeration(role, contentType),
    allowEdits: role !== 'guest',
    allowDeletes: role !== 'guest',
    moderationQueue: role === 'guest' ? 'high' : 'normal'
  };
}

/**
 * Check if user can moderate content
 */
export function canModerateContent(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Get content visibility rules
 */
export function getContentVisibility(
  status: ModerationStatus,
  role: UserRole
) {
  // Admins can see all content
  if (role === 'admin') return true;

  switch (status) {
    case 'approved':
      return true;
    case 'pending':
      return role !== 'guest';
    case 'flagged':
      return role !== 'guest';
    case 'rejected':
    case 'removed':
      return false;
    default:
      return false;
  }
}

/**
 * Get permitted actions for content
 */
export function getPermittedActions(
  role: UserRole,
  contentOwnerId: string,
  userId: string,
  status: ModerationStatus
): CommunityAction[] {
  const baseActions = communityPermissions[role] || [];
  
  // Filter actions based on content status
  return baseActions.filter(action => {
    // View is always allowed for approved content
    if (action === 'view_content' && status === 'approved') return true;
    
    // Only allow modifications on active content
    if (status === 'removed' || status === 'rejected') return false;
    
    // Content owner can edit/delete their content
    if (contentOwnerId === userId) {
      return ['update_post', 'delete_post', 'update_comment', 'delete_comment'].includes(action);
    }
    
    // Admins can moderate
    if (role === 'admin') return true;
    
    // Default to base permissions
    return baseActions.includes(action);
  });
}