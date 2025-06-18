const Submission = require('../models/submissions');
const User = require('../models/users');
const createPdf = require('../utils/createPdf');
const sendEmail = require('../utils/sendEmail');
const Joi = require('joi');
const axios = require('axios');
const mongoose = require('mongoose');


function validateSubmission(req) {
    const submissionSchema = Joi.object({
        jobRole: Joi.string().required().trim(),
        skills: Joi.array().items(Joi.string()).required(),
        experience: Joi.string().required(),
        education: Joi.string().required()
    });

    return submissionSchema.validate(req);
}

const generateSubmission = async (req, res) => {   
    try {
        const { jobRole, skills, experience, education } = req.body;
        if ( !jobRole, !skills, !experience, !education ) {
            return res.status(401).json({
                message: 'All fields are required'
            });
        }

        const { error, value } = validateSubmission({ jobRole, skills, experience, education });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findById(req.user.id);
        const fullName = user.fullName;
        const email= user.email;

        const resumePrompt = `
                            Generate a professional resume for the following candidate:

                            Full Name: ${fullName}
                            Email: ${email}
                            Job Role: ${jobRole}
                            Skills: ${skills.join(', ')}
                            Experience: ${experience}
                            Education: ${education}

                            Format it using clear headings like: Summary, Skills, Experience, Education, etc.
        `;

         const coverLetterPrompt = `
                Write a personalized cover letter for the following candidate applying as a ${jobRole}.

                Full Name: ${fullName}
                Email: ${email}
                Skills: ${skills.join(', ')}
                Experience: ${experience}
                Education: ${education}

                Make it job-targeted, concise, and professional.
            `;

            const apiKey = process.env.AZURE_API_KEY;

            const endpoint = 'https://vsmodel.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview'

            const resumeResponse = await axios.post(endpoint, {
                messages: [{
                    role: 'user',
                    content: resumePrompt
                }],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            },{
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                },
            });

             const resume = resumeResponse.data.choices[0].message.content.trim();
             
             const coverLetterResponse = await axios.post(endpoint, {
                messages: [
                    {
                        role: 'user',
                        content: coverLetterPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
             },
            {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            });

            const coverLetter = coverLetterResponse.data.choices[0].message.content.trim();

            const newSubmission = new Submission({
            user: req.user.id,
            fullName,
            email,
            jobRole,
            skills,
            experience,
            education,
            resume,
            coverLetter,
        });

        await newSubmission.save();
        // Generate PDFs
        const resumePDF = await createPdf('Resume', resume);
        const coverPDF = await createPdf('Cover Letter', coverLetter);

        //send email

        await sendEmail(email, 'Your AI-Generated Resume & Cover Letter', `Hi ${fullName},\n\nPlease find your attached resume and cover letter.`, [
            {
                filename: 'resume.pdf', content: resumePDF
            },
            {
                filename: 'cover_letter.pdf', content: coverPDF
            }
        ]);

        res.status(201).json({
            message: 'AI-generated resume and cover letter created successfully',
            data: {
                resume,
                coverLetter,
                submissionId: newSubmission._id
            }
        });
    }
    catch(err) {
        console.error("Submission error: ", err);
        res.status(500).json({ message: "Server error while generating submission" });
    }

}

const getSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({user: req.user.id}).sort({createdAt: -1});
        res.status(200).json({ 
            message: 'Fetched user submissions successfully',
            data: submissions
        });
    }
    catch(err) {
        console.error('Error fetching submissions:', err);
        res.status(500).json({
            message: 'Server error while fetching submissions'
        });
    }
}

const downloadPdf = async(req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { type } = req.query;

        //validate type
        if (!['resume', 'coverLetter'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid type. Must be \'resume\' or \'cover letter\''
            });
        }

        //fetch the submission
        const submission = await Submission.findOne({
            _id: id,
            user: userId
        });

        if (!submission) {
            return res.status(404).json({
                message: 'Submission not found.'
            });
        }

        const title = type === 'resume' ? 'Resume' : 'Cover Letter';

        const content = type === 'resume' ? submission.resume : submission.coverLetter;

        const pdf = await createPdf(title, content);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${type}.pdf"`
        });

        res.send(pdf);
    }
    catch(error) {
        console.error('PDF download error:', error);
        res.status(500).json({
            message: 'Error downloading PDF'
        });
    }
}

const getSingleSubmission = async (req, res) => {
        try {
            const { id } = req.params;
            const submission = await Submission.findOne({
                _id: new mongoose.Types.ObjectId(id),
                user: req.user.id
            });

            console.log(submission);

            res.status(200).json({ 
                message: 'Fetched user submission successfully',
                data: submission
            });
        }
        catch(err) {
            console.error('Error fetching submissions:', err);
            res.status(500).json({
                message: 'Server error while fetching submissions'
            });
        }   
    }

module.exports.generateSubmission = generateSubmission;
module.exports.getSubmissions = getSubmissions;
module.exports.downloadPdf = downloadPdf;
module.exports.getSingleSubmission = getSingleSubmission;

