<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Employee Report</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
    h1 { font-size: 18px; margin-bottom: 4px; }
    p.sub { color: #666; font-size: 11px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #3B82F6; color: #fff; text-align: left; padding: 6px 8px; font-size: 11px; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #F9FAFB; }
  </style>
</head>
<body>
  <h1>Employee Report</h1>
  <p class="sub">Generated: {{ now()->format('Y-m-d H:i') }}</p>

  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Department</th>
        <th>Position</th>
        <th>Role</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      @foreach($users as $user)
      <tr>
        <td>{{ $user->name }}</td>
        <td>{{ $user->email }}</td>
        <td>{{ $user->department?->name ?? '—' }}</td>
        <td>{{ $user->position ?? '—' }}</td>
        <td>{{ ucfirst($user->role) }}</td>
        <td>{{ $user->is_active ? 'Active' : 'Inactive' }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</body>
</html>
