package com.example.studentclient

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class AddStudentActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_student)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etCourse = findViewById<EditText>(R.id.etCourse)
        val etSemester = findViewById<EditText>(R.id.etSemester)
        val btnSubmit = findViewById<Button>(R.id.btnSubmit)

        btnSubmit.setOnClickListener {
            val name = etName.text.toString()
            val email = etEmail.text.toString()
            val course = etCourse.text.toString()
            val semester = etSemester.text.toString().toIntOrNull() ?: 1

            val student = Student(name = name, email = email, course = course, semester = semester)

            ApiClient.instance.addStudent(student).enqueue(object : Callback<Student> {
                override fun onResponse(call: Call<Student>, response: Response<Student>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@AddStudentActivity, "Student added!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else if (response.code() == 400) {
                        // Extract error details if needed, for now just show a Toast
                        Toast.makeText(this@AddStudentActivity, "Validation Error (400)", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this@AddStudentActivity, "Failed: ${response.code()}", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Student>, t: Throwable) {
                    Toast.makeText(this@AddStudentActivity, "Network Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }
}
