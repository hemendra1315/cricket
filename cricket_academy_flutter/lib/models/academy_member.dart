class AcademyMember {
  final String id;
  final String academyId;
  final String userId;
  final String role; // 'super_admin' | 'academy_owner' | 'coach' | 'player' | 'parent'
  final String status; // 'pending' | 'active' | 'suspended' | 'rejected' | 'left'
  final Map<String, dynamic>? academy;

  AcademyMember({
    required this.id,
    required this.academyId,
    required this.userId,
    required this.role,
    required this.status,
    this.academy,
  });

  factory AcademyMember.fromJson(Map<String, dynamic> json) {
    return AcademyMember(
      id: json['id'] as String,
      academyId: json['academy_id'] as String,
      userId: json['user_id'] as String,
      role: json['role'] as String? ?? 'player',
      status: json['status'] as String? ?? 'pending',
      academy: json['academies'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'academy_id': academyId,
      'user_id': userId,
      'role': role,
      'status': status,
      'academies': academy,
    };
  }
}
