<?php

namespace App\Modules\Backup\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use ZipArchive;

class BackupController extends Controller
{
    private string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
    }

    public function index(): JsonResponse
    {
        if (! is_dir($this->backupDir)) {
            return response()->json(['backups' => []]);
        }

        $files = collect(glob($this->backupDir . '/*.zip') ?: [])
            ->map(fn ($f) => [
                'filename'   => basename($f),
                'size'       => filesize($f),
                'created_at' => date('Y-m-d H:i:s', filemtime($f)),
            ])
            ->sortByDesc('created_at')
            ->values();

        return response()->json(['backups' => $files]);
    }

    public function run(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (! is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }

        $filename = 'backup_' . now()->format('Y_m_d_His') . '.zip';
        $zipPath  = $this->backupDir . '/' . $filename;

        try {
            $sql = $this->generateSqlDump();

            $zip = new ZipArchive();
            if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
                throw new \RuntimeException('Cannot create zip archive.');
            }
            $zip->addFromString('database.sql', $sql);
            $zip->close();

            return response()->json([
                'message'  => 'Backup created successfully.',
                'filename' => $filename,
            ]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Backup failed: ' . $e->getMessage()], 500);
        }
    }

    public function download(Request $request, string $filename): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        // Prevent path traversal — only allow the basename
        $filename = basename($filename);
        $path     = $this->backupDir . '/' . $filename;

        abort_unless(
            file_exists($path) && str_ends_with($filename, '.zip'),
            404,
            'Backup file not found.'
        );

        return response()->download($path);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    /**
     * Pure-PHP SQL dump — no mysqldump required.
     * Generates DROP + CREATE TABLE + INSERT statements for every table.
     */
    private function generateSqlDump(): string
    {
        $tables = DB::select('SHOW TABLES');
        $sql    = "-- EMS Database Dump\n-- " . now()->toDateTimeString() . "\n\n";
        $sql   .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $tableObj) {
            $table = array_values((array) $tableObj)[0];

            // CREATE TABLE
            $createRows = DB::select("SHOW CREATE TABLE `{$table}`");
            $createSql  = $createRows[0]->{'Create Table'} ?? $createRows[0]->{'Create View'} ?? '';
            $sql .= "DROP TABLE IF EXISTS `{$table}`;\n{$createSql};\n\n";

            // INSERT rows
            $rows = DB::table($table)->get();
            if ($rows->isEmpty()) {
                continue;
            }

            $columns = array_keys((array) $rows->first());
            $colList = implode(', ', array_map(fn ($c) => "`{$c}`", $columns));

            foreach ($rows as $row) {
                $values = array_map(function ($v) {
                    if (is_null($v)) {
                        return 'NULL';
                    }
                    return "'" . str_replace(["\\", "'"], ["\\\\", "\\'"], (string) $v) . "'";
                }, (array) $row);

                $sql .= "INSERT INTO `{$table}` ({$colList}) VALUES (" . implode(', ', $values) . ");\n";
            }
            $sql .= "\n";
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";

        return $sql;
    }
}

