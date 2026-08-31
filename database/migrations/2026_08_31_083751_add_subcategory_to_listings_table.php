<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // Nullable so legacy/draft rows stay valid; new listings require it
            // via validation. Belongs to the parent Category (see App\Enums).
            $table->string('subcategory')->nullable()->after('category');
            $table->index(['category', 'subcategory']);
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex(['category', 'subcategory']);
            $table->dropColumn('subcategory');
        });
    }
};
