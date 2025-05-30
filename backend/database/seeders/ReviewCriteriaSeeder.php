<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReviewTemplate;
use App\Models\ReviewCriteria;
use Illuminate\Support\Facades\DB;

class ReviewCriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // First, ensure we have review templates
        $this->createReviewTemplatesIfNeeded();
        
        // Then create criteria for each template
        $this->createCriteriaForTemplates();
        
        $this->command->info('Review criteria created successfully!');
    }
    
    private function createReviewTemplatesIfNeeded()
    {
        // Check if templates exist, if not create them
        $templateCount = ReviewTemplate::count();
        
        if ($templateCount === 0) {
            $this->command->info('No review templates found. Creating default templates...');
            
            $templates = [
                [
                    'name' => 'Annual Performance Review',
                    'description' => 'Comprehensive annual review covering all aspects of employee performance',
                    'type' => 'annual',
                    'active' => true,
                    'criteria_structure' => [
                        'sections' => [
                            'Technical Skills',
                            'Communication',
                            'Leadership',
                            'Problem Solving',
                            'Teamwork'
                        ]
                    ]
                ],
                [
                    'name' => 'Quarterly Check-in',
                    'description' => 'Brief quarterly performance check-in',
                    'type' => 'quarterly',
                    'active' => true,
                    'criteria_structure' => [
                        'sections' => [
                            'Goal Progress',
                            'Skills Development',
                            'Feedback'
                        ]
                    ]
                ],
                [
                    'name' => 'Probation Review',
                    'description' => 'Review for employees in probation period',
                    'type' => 'probation',
                    'active' => true,
                    'criteria_structure' => [
                        'sections' => [
                            'Job Performance',
                            'Attendance',
                            'Company Culture Fit'
                        ]
                    ]
                ]
            ];
            
            foreach ($templates as $templateData) {
                ReviewTemplate::create($templateData);
            }
        }
    }
    
    private function createCriteriaForTemplates()
    {
        $templates = ReviewTemplate::all();
        
        foreach ($templates as $template) {
            // Check if this template already has criteria
            $existingCriteria = ReviewCriteria::where('review_template_id', $template->id)->count();
            
            if ($existingCriteria === 0) {
                $this->command->info("Creating criteria for template: {$template->name}");
                $this->createCriteriaForTemplate($template);
            } else {
                $this->command->info("Template '{$template->name}' already has {$existingCriteria} criteria. Skipping...");
            }
        }
    }
    
    private function createCriteriaForTemplate($template)
    {
        $criteriaByType = [
            'annual' => [
                [
                    'criteria_name' => 'Technical Skills',
                    'criteria_description' => 'Technical competency and expertise in job-related skills',
                    'weight' => 25.00
                ],
                [
                    'criteria_name' => 'Communication',
                    'criteria_description' => 'Verbal and written communication skills with team and clients',
                    'weight' => 20.00
                ],
                [
                    'criteria_name' => 'Leadership',
                    'criteria_description' => 'Leadership qualities and mentoring abilities',
                    'weight' => 20.00
                ],
                [
                    'criteria_name' => 'Problem Solving',
                    'criteria_description' => 'Analytical thinking and problem-solving capabilities',
                    'weight' => 20.00
                ],
                [
                    'criteria_name' => 'Teamwork',
                    'criteria_description' => 'Collaboration and team participation',
                    'weight' => 15.00
                ],
            ],
            'quarterly' => [
                [
                    'criteria_name' => 'Goal Progress',
                    'criteria_description' => 'Progress towards quarterly goals and objectives',
                    'weight' => 50.00
                ],
                [
                    'criteria_name' => 'Skills Development',
                    'criteria_description' => 'Learning new skills and professional development',
                    'weight' => 30.00
                ],
                [
                    'criteria_name' => 'Feedback Implementation',
                    'criteria_description' => 'Response to feedback and coaching from supervisors',
                    'weight' => 20.00
                ],
            ],
            'probation' => [
                [
                    'criteria_name' => 'Job Performance',
                    'criteria_description' => 'Overall job performance and quality of work output',
                    'weight' => 60.00
                ],
                [
                    'criteria_name' => 'Attendance & Punctuality',
                    'criteria_description' => 'Consistency in attendance and punctuality',
                    'weight' => 20.00
                ],
                [
                    'criteria_name' => 'Company Culture Fit',
                    'criteria_description' => 'Alignment with company values and team integration',
                    'weight' => 20.00
                ],
            ]
        ];
        
        // Get criteria for this template type, or use annual as default
        $criteria = $criteriaByType[$template->type] ?? $criteriaByType['annual'];
        
        foreach ($criteria as $index => $criterionData) {
            ReviewCriteria::create([
                'review_template_id' => $template->id,
                'criteria_name' => $criterionData['criteria_name'],
                'criteria_description' => $criterionData['criteria_description'],
                'weight' => $criterionData['weight'],
                'sort_order' => $index + 1,
                'score' => null, // No score for template criteria
                'comments' => null, // No comments for template criteria
                'review_id' => null, // This is a template criterion, not tied to specific review
            ]);
        }
        
        $this->command->info("Created " . count($criteria) . " criteria for '{$template->name}'");
    }
}