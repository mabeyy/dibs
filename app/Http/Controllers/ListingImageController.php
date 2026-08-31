<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ListingImageController extends Controller
{
    public function store(Request $request, Listing $listing): RedirectResponse
    {
        $this->authorize('update', $listing);

        $request->validate([
            'images' => ['required', 'array', 'max:8'],
            'images.*' => ['image', 'max:5120'],
        ]);

        if ($listing->images()->count() + count($request->file('images')) > 8) {
            throw ValidationException::withMessages(['images' => 'A listing can have at most 8 images.']);
        }

        $nextOrder = (int) $listing->images()->max('sort_order') + 1;

        foreach ($request->file('images') as $file) {
            $listing->images()->create([
                'path' => $file->store('listings', 'public'),
                'sort_order' => $nextOrder++,
            ]);
        }

        return back();
    }

    public function destroy(Listing $listing, ListingImage $image): RedirectResponse
    {
        $this->authorize('update', $listing);

        abort_unless($image->listing_id === $listing->id, 404);

        Storage::disk('public')->delete($image->path);
        $image->delete();

        return back();
    }
}
