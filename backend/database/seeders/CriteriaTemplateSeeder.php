<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReviewTemplate;
use App\Models\ReviewCriteria;
use Illuminate\Support\Facades\DB;

class CriteriaTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Creating comprehensive criteria templates...');
        
        // Define comprehensive criteria templates by category
        $criteriaTemplates = $this->getCriteriaTemplates();
        
        // Get all existing review templates
        $reviewTemplates = ReviewTemplate::all();
        
        if ($reviewTemplates->isEmpty()) {
            $this->command->warn('No review templates found. Creating default templates first...');
            $this->createDefaultTemplates();
            $reviewTemplates = ReviewTemplate::all();
        }
        
        foreach ($reviewTemplates as $template) {
            $this->createCriteriaForTemplate($template, $criteriaTemplates);
        }
        
        // Also create standalone criteria library for future use
        $this->createStandaloneCriteriaLibrary($criteriaTemplates);
        
        $this->command->info('Criteria templates created successfully!');
    }
    
    private function getCriteriaTemplates()
    {
        return [
            'technical' => [
                [
                    'criteria_name' => 'Technical Proficiency',
                    'criteria_description' => 'Demonstrates strong technical skills and stays current with industry standards and best practices',
                    'default_weight' => 25.00,
                    'category' => 'technical'
                ],
                [
                    'criteria_name' => 'Code Quality',
                    'criteria_description' => 'Writes clean, maintainable, and well-documented code following established conventions',
                    'default_weight' => 20.00,
                    'category' => 'technical'
                ],
                [
                    'criteria_name' => 'System Design',
                    'criteria_description' => 'Ability to design scalable and efficient systems and architectures',
                    'default_weight' => 15.00,
                    'category' => 'technical'
                ],
                [
                    'criteria_name' => 'Technology Adoption',
                    'criteria_description' => 'Learns and adapts to new technologies and tools effectively',
                    'default_weight' => 10.00,
                    'category' => 'technical'
                ]
            ],
            'communication' => [
                [
                    'criteria_name' => 'Verbal Communication',
                    'criteria_description' => 'Communicates ideas clearly and effectively in meetings and presentations',
                    'default_weight' => 15.00,
                    'category' => 'communication'
                ],
                [
                    'criteria_name' => 'Written Communication',
                    'criteria_description' => 'Produces clear, concise, and professional written documentation and correspondence',
                    'default_weight' => 15.00,
                    'category' => 'communication'
                ],
                [
                    'criteria_name' => 'Active Listening',
                    'criteria_description' => 'Listens effectively to understand requirements and feedback from others',
                    'default_weight' => 10.00,
                    'category' => 'communication'
                ]
            ],
            'leadership' => [
                [
                    'criteria_name' => 'Team Leadership',
                    'criteria_description' => 'Effectively leads and motivates team members towards common goals',
                    'default_weight' => 20.00,
                    'category' => 'leadership'
                ],
                [
                    'criteria_name' => 'Mentoring',
                    'criteria_description' => 'Provides guidance and support to help others develop their skills',
                    'default_weight' => 15.00,
                    'category' => 'leadership'
                ],
                [
                    'criteria_name' => 'Decision Making',
                    'criteria_description' => 'Makes sound decisions in a timely manner with available information',
                    'default_weight' => 15.00,
                    'category' => 'leadership'
                ],
                [
                    'criteria_name' => 'Delegation',
                    'criteria_description' => 'Effectively assigns tasks and responsibilities to appropriate team members',
                    'default_weight' => 10.00,
                    'category' => 'leadership'
                ]
            ],
            'performance' => [
                [
                    'criteria_name' => 'Quality of Work',
                    'criteria_description' => 'Consistently delivers high-quality work that meets or exceeds expectations',
                    'default_weight' => 25.00,
                    'category' => 'performance'
                ],
                [
                    'criteria_name' => 'Productivity',
                    'criteria_description' => 'Manages time effectively and completes tasks efficiently',
                    'default_weight' => 20.00,
                    'category' => 'performance'
                ],
                [
                    'criteria_name' => 'Goal Achievement',
                    'criteria_description' => 'Meets or exceeds established performance goals and targets',
                    'default_weight' => 20.00,
                    'category' => 'performance'
                ],
                [
                    'criteria_name' => 'Initiative',
                    'criteria_description' => 'Takes initiative to identify and solve problems proactively',
                    'default_weight' => 15.00,
                    'category' => 'performance'
                ]
            ],
            'teamwork' => [
                [
                    'criteria_name' => 'Collaboration',
                    'criteria_description' => 'Works effectively with others to achieve team objectives',
                    'default_weight' => 20.00,
                    'category' => 'teamwork'
                ],
                [
                    'criteria_name' => 'Conflict Resolution',
                    'criteria_description' => 'Handles disagreements and conflicts constructively',
                    'default_weight' => 15.00,
                    'category' => 'teamwork'
                ],
                [
                    'criteria_name' => 'Support',
                    'criteria_description' => 'Provides assistance and support to team members when needed',
                    'default_weight' => 10.00,
                    'category' => 'teamwork'
                ]
            ],
            'problem_solving' => [
                [
                    'criteria_name' => 'Analytical Thinking',
                    'criteria_description' => 'Breaks down complex problems into manageable components',
                    'default_weight' => 20.00,
                    'category' => 'problem_solving'
                ],
                [
                    'criteria_name' => 'Creative Solutions',
                    'criteria_description' => 'Develops innovative and creative solutions to challenges',
                    'default_weight' => 15.00,
                    'category' => 'problem_solving'
                ],
                [
                    'criteria_name' => 'Research Skills',
                    'criteria_description' => 'Effectively researches and gathers information to solve problems',
                    'default_weight' => 10.00,
                    'category' => 'problem_solving'
                ]
            ],
            'professional_development' => [
                [
                    'criteria_name' => 'Continuous Learning',
                    'criteria_description' => 'Actively seeks opportunities to learn and improve skills',
                    'default_weight' => 15.00,
                    'category' => 'professional_development'
                ],
                [
                    'criteria_name' => 'Skill Development',
                    'criteria_description' => 'Develops new skills relevant to current and future roles',
                    'default_weight' => 10.00,
                    'category' => 'professional_development'
                ],
                [
                    'criteria_name' => 'Knowledge Sharing',
                    'criteria_description' => 'Shares knowledge and expertise with team members and organization',
                    'default_weight' => 10.00,
                    'category' => 'professional_development'
                ]
            ]
        ];
    }
    
    private function createDefaultTemplates()
    {
        $templates = [
            [
                'name' => 'Comprehensive Annual Review',
                'description' => 'Complete annual performance review covering all aspects of employee performance',
                'type' => 'annual',
                'active' => true,
                'criteria_structure' => ['comprehensive' => true]
            ],
            [
                'name' => 'Technical Skills Assessment',
                'description' => 'Focused assessment of technical competencies and skills',
                'type' => 'technical',
                'active' => true,
                'criteria_structure' => ['focus' => 'technical']
            ],
            [
                'name' => 'Leadership Evaluation',
                'description' => 'Assessment of leadership qualities and management capabilities',
                'type' => 'leadership',
                'active' => true,
                'criteria_structure' => ['focus' => 'leadership']
            ],
            [
                'name' => 'Quarterly Performance Check',
                'description' => 'Brief quarterly review focusing on goals and development',
                'type' => 'quarterly',
                'active' => true,
                'criteria_structure' => ['focus' => 'performance']
            ]
        ];
        
        foreach ($templates as $templateData) {
            ReviewTemplate::create($templateData);
        }
    }
    
    private function createCriteriaForTemplate($template, $criteriaTemplates)
    {
        // Check if this template already has criteria
        $existingCriteria = ReviewCriteria::where('review_template_id', $template->id)
                                        ->whereNull('review_id')
                                        ->count();
        
        if ($existingCriteria > 0) {
            $this->command->info("Template '{$template->name}' already has {$existingCriteria} criteria. Skipping...");
            return;
        }
        
        $this->command->info("Creating criteria for template: {$template->name}");
        
        // Select criteria based on template type
        $selectedCriteria = $this->selectCriteriaForTemplate($template, $criteriaTemplates);
        
        foreach ($selectedCriteria as $index => $criterionData) {
            ReviewCriteria::create([
                'review_template_id' => $template->id,
                'review_id' => null, // This is a template criterion
                'criteria_name' => $criterionData['criteria_name'],
                'criteria_description' => $criterionData['criteria_description'],
                'weight' => $criterionData['default_weight'],
                'score' => null, // No score for template criteria
                'comments' => null, // No comments for template criteria
                'sort_order' => $index + 1,
            ]);
        }
        
        $this->command->info("Created " . count($selectedCriteria) . " criteria for '{$template->name}'");
    }
    
    private function selectCriteriaForTemplate($template, $criteriaTemplates)
    {
        switch ($template->type) {
            case 'technical':
                return array_merge(
                    $criteriaTemplates['technical'],
                    array_slice($criteriaTemplates['problem_solving'], 0, 2),
                    array_slice($criteriaTemplates['professional_development'], 0, 1)
                );
                
            case 'leadership':
                return array_merge(
                    $criteriaTemplates['leadership'],
                    array_slice($criteriaTemplates['communication'], 0, 2),
                    array_slice($criteriaTemplates['teamwork'], 0, 2)
                );
                
            case 'annual':
            case 'comprehensive':
                // Use a balanced mix of all categories
                return array_merge(
                    array_slice($criteriaTemplates['performance'], 0, 3),
                    array_slice($criteriaTemplates['technical'], 0, 2),
                    array_slice($criteriaTemplates['communication'], 0, 2),
                    array_slice($criteriaTemplates['teamwork'], 0, 2),
                    array_slice($criteriaTemplates['leadership'], 0, 2),
                    array_slice($criteriaTemplates['problem_solving'], 0, 1)
                );
                
            case 'quarterly':
                return array_merge(
                    array_slice($criteriaTemplates['performance'], 0, 2),
                    array_slice($criteriaTemplates['professional_development'], 0, 2)
                );
                
            default:
                // Default balanced criteria
                return array_merge(
                    array_slice($criteriaTemplates['performance'], 0, 2),
                    array_slice($criteriaTemplates['communication'], 0, 1),
                    array_slice($criteriaTemplates['teamwork'], 0, 1),
                    array_slice($criteriaTemplates['problem_solving'], 0, 1)
                );
        }
    }
    
    private function createStandaloneCriteriaLibrary($criteriaTemplates)
    {
        $this->command->info('Creating standalone criteria library for future use...');
        
        // You could create a separate table for criteria library
        // or store them as JSON in a configuration table
        // For now, we'll just log the available criteria
        
        $totalCriteria = 0;
        foreach ($criteriaTemplates as $category => $criteria) {
            $totalCriteria += count($criteria);
        }
        
        $this->command->info("Created criteria library with {$totalCriteria} different criteria across " . count($criteriaTemplates) . " categories");
    }
}