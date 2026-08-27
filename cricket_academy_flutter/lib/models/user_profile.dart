class UserProfile {
  final String id;
  final String? fullName;
  final String? email;
  final String? phone;
  final String? avatarUrl;
  final bool isSuperAdmin;

  UserProfile({
    required this.id,
    this.fullName,
    this.email,
    this.phone,
    this.avatarUrl,
    this.isSuperAdmin = false,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      fullName: json['full_name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      isSuperAdmin: json['is_super_admin'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'avatar_url': avatarUrl,
      'is_super_admin': isSuperAdmin,
    };
  }
}
