<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Models\BusinessCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessCategoryController extends Controller
{
    /**
     * Display a listing of business categories.
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = (string) $request->get('search', '');
        $status = (string) $request->get('status', 'all');

        $query = BusinessCategory::query()->orderBy('name');

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

        $categories = $paginator->getCollection()->map(fn (BusinessCategory $cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'description' => $cat->description,
            'is_active' => (bool) $cat->is_active,
            'created_at' => $cat->created_at?->toISOString(),
            'updated_at' => $cat->updated_at?->toISOString(),
        ])->values()->all();

        return Inertia::render('user-management/business-categories', [
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
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created business category.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:business_categories,name'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        BusinessCategory::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', 'Business category created successfully.');
    }

    /**
     * Update the specified business category.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $category = BusinessCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:business_categories,name,' . $category->id],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $category->is_active,
        ]);

        return back()->with('success', 'Business category updated successfully.');
    }

    /**
     * Toggle the active status of a business category.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse|RedirectResponse
    {
        $category = BusinessCategory::findOrFail($id);
        $category->is_active = ! $category->is_active;
        $category->save();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'is_active' => $category->is_active,
                'message' => 'Status updated successfully.',
            ]);
        }

        return back()->with('success', 'Status updated successfully.');
    }

    /**
     * Remove the specified business category from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $category = BusinessCategory::findOrFail($id);
        $category->delete();

        return back()->with('success', 'Business category deleted successfully.');
    }
}
