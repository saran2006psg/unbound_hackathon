from app.database import supabase_admin
from app.models import RuleVoteCreate, VoteType, ApprovalStatus
from typing import List, Dict, Any

class VotingService:
    
    @staticmethod
    def create_rule_with_approval(rule_data: dict, creator_id: int) -> dict:
        """Create a rule that requires approval"""
        threshold = rule_data.get('approval_threshold', 1)
        
        # If threshold is 1, auto-approve (creator's implicit vote)
        status = 'ACTIVE' if threshold <= 1 else 'PENDING'
        
        # Create rule
        result = supabase_admin.table('rules').insert({
            'pattern': rule_data['pattern'],
            'action': rule_data['action'],
            'priority': rule_data['priority'],
            'description': rule_data.get('description'),
            'approval_threshold': threshold,
            'approval_status': status,
            'created_by': creator_id
        }).execute()
        
        rule = result.data[0]
        
        # If pending, notify all other admins
        if status == 'PENDING':
            VotingService.notify_admins_for_approval(rule['id'], creator_id)
        
        return rule
    
    @staticmethod
    def notify_admins_for_approval(rule_id: int, creator_id: int):
        """Notify all admins except creator about pending rule"""
        # Get all admins
        admins_result = supabase_admin.table('users').select('id, name').eq('role', 'admin').execute()
        
        # Get rule details
        rule_result = supabase_admin.table('rules').select('*').eq('id', rule_id).execute()
        rule = rule_result.data[0]
        
        # Create notifications for all admins except creator
        notifications = []
        for admin in admins_result.data:
            if admin['id'] != creator_id:
                notifications.append({
                    'rule_id': rule_id,
                    'admin_id': admin['id'],
                    'message': f"New rule '{rule['pattern']}' requires your approval ({rule['approval_threshold']} votes needed)"
                })
        
        if notifications:
            supabase_admin.table('rule_notifications').insert(notifications).execute()
    
    @staticmethod
    def vote_on_rule(rule_id: int, admin_id: int, vote_data: RuleVoteCreate) -> Dict[str, Any]:
        """Admin votes on a pending rule"""
        # Check if rule exists and is pending
        rule_result = supabase_admin.table('rules').select('*').eq('id', rule_id).execute()
        if not rule_result.data:
            raise ValueError("Rule not found")
        
        rule = rule_result.data[0]
        
        if rule['approval_status'] != 'PENDING':
            raise ValueError(f"Rule is already {rule['approval_status']}")
        
        # Check if admin already voted
        existing_vote = supabase_admin.table('rule_votes').select('*').eq('rule_id', rule_id).eq('admin_id', admin_id).execute()
        
        if existing_vote.data:
            raise ValueError("You have already voted on this rule")
        
        # Record vote
        supabase_admin.table('rule_votes').insert({
            'rule_id': rule_id,
            'admin_id': admin_id,
            'vote': vote_data.vote.value,
            'comment': vote_data.comment
        }).execute()
        
        # Count votes
        votes = supabase_admin.table('rule_votes').select('vote').eq('rule_id', rule_id).execute()
        
        approve_count = sum(1 for v in votes.data if v['vote'] == 'APPROVE')
        reject_count = sum(1 for v in votes.data if v['vote'] == 'REJECT')
        
        # Check if threshold is met
        new_status = None
        if approve_count >= rule['approval_threshold']:
            new_status = 'ACTIVE'
            VotingService.notify_rule_decision(rule_id, 'approved', approve_count)
        elif reject_count >= rule['approval_threshold']:
            new_status = 'REJECTED'
            VotingService.notify_rule_decision(rule_id, 'rejected', reject_count)
        
        # Update rule status if decision reached
        if new_status:
            supabase_admin.table('rules').update({
                'approval_status': new_status
            }).eq('id', rule_id).execute()
        
        return {
            'rule_id': rule_id,
            'your_vote': vote_data.vote.value,
            'approve_count': approve_count,
            'reject_count': reject_count,
            'threshold': rule['approval_threshold'],
            'new_status': new_status or 'PENDING',
            'decision_reached': new_status is not None
        }
    
    @staticmethod
    def notify_rule_decision(rule_id: int, decision: str, vote_count: int):
        """Notify all admins when a rule decision is reached"""
        # Get rule and all admins who voted
        rule_result = supabase_admin.table('rules').select('*').eq('id', rule_id).execute()
        rule = rule_result.data[0]
        
        votes_result = supabase_admin.table('rule_votes').select('admin_id').eq('rule_id', rule_id).execute()
        admin_ids = [v['admin_id'] for v in votes_result.data]
        
        # Add creator to notification list
        if rule['created_by']:
            admin_ids.append(rule['created_by'])
        
        # Create notifications
        notifications = []
        for admin_id in set(admin_ids):
            notifications.append({
                'rule_id': rule_id,
                'admin_id': admin_id,
                'message': f"Rule '{rule['pattern']}' has been {decision} with {vote_count} votes"
            })
        
        if notifications:
            supabase_admin.table('rule_notifications').insert(notifications).execute()
    
    @staticmethod
    def get_pending_rules() -> List[dict]:
        """Get all rules pending approval"""
        result = supabase_admin.table('rules').select('*').eq('approval_status', 'PENDING').order('created_at', desc=True).execute()
        
        # Enrich with vote counts
        enriched_rules = []
        for rule in result.data:
            votes = supabase_admin.table('rule_votes').select('vote').eq('rule_id', rule['id']).execute()
            rule['approval_count'] = sum(1 for v in votes.data if v['vote'] == 'APPROVE')
            rule['rejection_count'] = sum(1 for v in votes.data if v['vote'] == 'REJECT')
            enriched_rules.append(rule)
        
        return enriched_rules
    
    @staticmethod
    def get_rule_votes(rule_id: int) -> List[dict]:
        """Get all votes for a rule"""
        result = supabase_admin.table('rule_votes').select('*, users(name)').eq('rule_id', rule_id).execute()
        
        votes = []
        for vote in result.data:
            votes.append({
                'id': vote['id'],
                'rule_id': vote['rule_id'],
                'admin_id': vote['admin_id'],
                'admin_name': vote['users']['name'],
                'vote': vote['vote'],
                'comment': vote['comment'],
                'voted_at': vote['voted_at']
            })
        
        return votes
    
    @staticmethod
    def get_admin_notifications(admin_id: int, unread_only: bool = False) -> List[dict]:
        """Get notifications for an admin"""
        query = supabase_admin.table('rule_notifications').select('*, rules(pattern)').eq('admin_id', admin_id)
        
        if unread_only:
            query = query.eq('is_read', False)
        
        result = query.order('created_at', desc=True).execute()
        
        notifications = []
        for notif in result.data:
            # Handle case where rule might have been deleted
            rule_pattern = notif.get('rules', {}).get('pattern', 'Unknown') if notif.get('rules') else 'Unknown'
            
            notifications.append({
                'id': notif['id'],
                'rule_id': notif['rule_id'],
                'rule_pattern': rule_pattern,
                'message': notif['message'],
                'is_read': notif['is_read'],
                'created_at': notif['created_at']
            })
        
        return notifications
    
    @staticmethod
    def mark_notification_read(notification_id: int, admin_id: int):
        """Mark a notification as read"""
        supabase_admin.table('rule_notifications').update({
            'is_read': True
        }).eq('id', notification_id).eq('admin_id', admin_id).execute()
