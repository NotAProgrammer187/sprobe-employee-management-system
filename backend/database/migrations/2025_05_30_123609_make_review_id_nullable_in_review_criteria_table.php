<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('review_criteria', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['review_id']);
            
            // Modify the column to be nullable
            $table->foreignId('review_id')->nullable()->change();
            
            // Re-add the foreign key constraint with nullable
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('review_criteria', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['review_id']);
            
            // Change back to not nullable
            $table->foreignId('review_id')->nullable(false)->change();
            
            // Re-add the foreign key constraint
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
        });
    }
};