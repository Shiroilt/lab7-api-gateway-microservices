package com.example.studentclient

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.Call

data class Student(
    val id: Int? = null,
    val name: String,
    val email: String,
    val course: String,
    val semester: Int
)

data class ErrorResponse(
    val error: String,
    val details: List<String>
)

interface StudentApi {
    @GET("students")
    fun getStudents(): Call<List<Student>>

    @POST("students")
    fun addStudent(@Body student: Student): Call<Student>
}

object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:3000/"

    val instance: StudentApi by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        retrofit.create(StudentApi::class.java)
    }
}
