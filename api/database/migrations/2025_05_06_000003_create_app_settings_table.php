<?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    return new class extends Migration
    {
        public function up()
        {
            Schema::create('app_settings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->string('key')->unique();
                $table->text('value');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        public function down()
        {
            Schema::dropIfExists('app_settings');
        }
    };