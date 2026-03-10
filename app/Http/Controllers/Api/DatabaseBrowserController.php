<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DatabaseBrowserController extends Controller
{
    public function tables()
    {
        $database = config('database.connections.mysql.database');

        $tables = DB::table('information_schema.tables')
            ->selectRaw('TABLE_NAME as table_name')
            ->where('TABLE_SCHEMA', $database)
            ->orderBy('TABLE_NAME')
            ->get()
            ->pluck('table_name');

        return response()->json([
            'database' => $database,
            'tables' => $tables,
        ]);
    }

    public function columns(string $table)
    {
        $database = config('database.connections.mysql.database');

        $exists = DB::table('information_schema.tables')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', $table)
            ->exists();

        if (! $exists) {
            return response()->json(['message' => 'Table not found.'], 404);
        }

        $columns = DB::table('information_schema.columns')
            ->selectRaw('COLUMN_NAME as column_name, DATA_TYPE as data_type, IS_NULLABLE as is_nullable, COLUMN_KEY as column_key')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', $table)
            ->orderBy('ORDINAL_POSITION')
            ->get();

        return response()->json([
            'table' => $table,
            'columns' => $columns,
        ]);
    }

    public function rows(Request $request, string $table)
    {
        $database = config('database.connections.mysql.database');

        $exists = DB::table('information_schema.tables')
            ->where('TABLE_SCHEMA', $database)
            ->where('TABLE_NAME', $table)
            ->exists();

        if (! $exists) {
            return response()->json(['message' => 'Table not found.'], 404);
        }

        $perPage = (int) $request->input('per_page', 20);
        $perPage = max(1, min($perPage, 100));

        $query = DB::table($table);

        if ($search = $request->input('search')) {
            $columns = DB::getSchemaBuilder()->getColumnListing($table);

            $query->where(function ($q) use ($columns, $search): void {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'like', "%{$search}%");
                }
            });
        }

        $rows = $query->paginate($perPage);

        return response()->json($rows);
    }
}

