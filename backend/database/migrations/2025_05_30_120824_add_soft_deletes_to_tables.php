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
        // Add soft deletes to employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to review_templates table
        Schema::table('review_templates', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Add soft deletes to review_criteria table
        Schema::table('review_criteria', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove soft deletes from employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Remove soft deletes from reviews table
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Remove soft deletes from review_templates table
        Schema::table('review_templates', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        // Remove soft deletes from review_criteria table
        Schema::table('review_criteria', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};