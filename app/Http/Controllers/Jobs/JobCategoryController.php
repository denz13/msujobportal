<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Models\JobCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobCategoryController extends Controller
{
    /**
     * Display a listing of job categories.
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = (string) $request->get('search', '');
        $status = (string) $request->get('status', 'all');

        $query = JobCategory::query()->orderBy('name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $paginator = $query->paginate($perPage)->withQueryString();

        $categories = $paginator->getCollection()->map(fn (JobCategory $cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'description' => $cat->description,
            'is_active' => (bool) $cat->is_active,
            'created_at' => $cat->created_at?->toISOString(),
            'updated_at' => $cat->updated_at?->toISOString(),
        ])->values()->all();

        return Inertia::render('jobs/job-categories', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'pagination' => [
                'links' => $paginator->linkCollection()->toArray(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'current_page' => $paginator->currentPage(),
            ],
        ]);
    }

    /**
     * Store a newly created job category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:job_categories,name',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        JobCategory::create([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('job-categories.index')->with('toast', [
            'type' => 'success',
            'message' => 'Job category created successfully.',
        ]);
    }

    /**
     * Update the specified job category.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $category = JobCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:job_categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update([
            'name' => trim($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $category->is_active,
        ]);

        return redirect()->route('job-categories.index')->with('toast', [
            'type' => 'success',
            'message' => 'Job category updated successfully.',
        ]);
    }

    /**
     * Toggle the active status of a category.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $category = JobCategory::findOrFail($id);

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $category->is_active = $request->boolean('is_active');
        $category->save();

        return response()->json([
            'message' => $category->is_active
                ? 'Category activated successfully.'
                : 'Category deactivated successfully.',
            'is_active' => $category->is_active,
        ]);
    }

    /**
     * Remove the specified job category.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = JobCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Job category deleted successfully.',
        ]);
    }
}
