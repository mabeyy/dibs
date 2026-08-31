<?php

use App\Http\Controllers\Admin\ShopVerificationController;
use App\Http\Controllers\BidController;
use App\Http\Controllers\BrowseController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ListingImageController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShopApplicationController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\ShopReviewController;
use App\Http\Controllers\WatchlistController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public marketplace
Route::get('browse', [BrowseController::class, 'index'])->name('browse');
Route::get('listings/{listing}', [BrowseController::class, 'show'])->name('listings.show');
Route::get('shops/{shop:slug}', [ShopController::class, 'show'])->name('shops.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Become a seller
    Route::get('sell/apply', [ShopApplicationController::class, 'create'])->name('seller.apply');
    Route::post('sell/apply', [ShopApplicationController::class, 'store'])->name('seller.apply.store');

    // Seller listing management
    Route::get('sell/listings', [ListingController::class, 'index'])->name('seller.listings.index');
    Route::get('sell/listings/create', [ListingController::class, 'create'])->name('seller.listings.create');
    Route::post('sell/listings', [ListingController::class, 'store'])->name('seller.listings.store');
    Route::get('sell/listings/{listing}/edit', [ListingController::class, 'edit'])->name('seller.listings.edit');
    Route::patch('sell/listings/{listing}', [ListingController::class, 'update'])->name('seller.listings.update');
    Route::delete('sell/listings/{listing}', [ListingController::class, 'destroy'])->name('seller.listings.destroy');

    Route::post('sell/listings/{listing}/images', [ListingImageController::class, 'store'])->name('seller.listings.images.store');
    Route::delete('sell/listings/{listing}/images/{image}', [ListingImageController::class, 'destroy'])->name('seller.listings.images.destroy');

    // Bidding
    Route::post('listings/{listing}/bids', [BidController::class, 'store'])->name('bids.store');

    // Watchlist
    Route::get('watchlist', [WatchlistController::class, 'index'])->name('watchlist.index');
    Route::post('listings/{listing}/watch', [WatchlistController::class, 'toggle'])->name('watchlist.toggle');

    // Orders
    Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
    Route::post('listings/{listing}/buy', [OrderController::class, 'store'])->name('orders.store');
    Route::patch('orders/{order}/ship', [OrderController::class, 'ship'])->name('orders.ship');
    Route::patch('orders/{order}/receive', [OrderController::class, 'receive'])->name('orders.receive');
    Route::post('orders/{order}/review', [ShopReviewController::class, 'store'])->name('orders.review');
});

// Admin moderation
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('shops', [ShopVerificationController::class, 'index'])->name('shops.index');
    Route::patch('shops/{shop}/verify', [ShopVerificationController::class, 'verify'])->name('shops.verify');
    Route::patch('shops/{shop}/reject', [ShopVerificationController::class, 'reject'])->name('shops.reject');
    Route::patch('shops/{shop}/suspend', [ShopVerificationController::class, 'suspend'])->name('shops.suspend');
});

require __DIR__.'/settings.php';
