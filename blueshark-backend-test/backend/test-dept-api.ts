import axios from 'axios';

async function testDepartmentAPI() {
  console.log('\n=== TESTING DEPARTMENT KANBAN API ===\n');

  try {
    // Get departments first
    const deptsResponse = await axios.get('http://localhost:5000/api/departments');
    const departments = deptsResponse.data;

    console.log('📋 All Departments:');
    departments.forEach((dept: any) => {
      console.log(`   ${dept.id}: ${dept.name}`);
    });

    // Find Dep-X
    const depX = departments.find((d: any) => d.name === 'Dep-X');
    if (!depX) {
      console.log('\n❌ Dep-X not found!');
      return;
    }

    console.log(`\n✅ Found Dep-X (ID: ${depX.id})\n`);

    // Call the sub-batches endpoint
    console.log(`🔍 Calling: GET /api/departments/${depX.id}/sub-batches\n`);

    const response = await axios.get(`http://localhost:5000/api/departments/${depX.id}/sub-batches`);

    console.log('📦 API Response:');
    console.log(JSON.stringify(response.data, null, 2));

    // Check kanban data
    const kanbanData = response.data.data;
    console.log('\n📊 Kanban Summary:');
    console.log(`   New Arrivals: ${kanbanData.newArrival?.length || 0} items`);
    console.log(`   In Progress: ${kanbanData.inProgress?.length || 0} items`);
    console.log(`   Completed: ${kanbanData.completed?.length || 0} items`);

    if (kanbanData.newArrival && kanbanData.newArrival.length > 0) {
      console.log('\n🆕 New Arrival Items:');
      kanbanData.newArrival.forEach((item: any) => {
        console.log(`   - ${item.sub_batch?.name || 'Unknown'} (Stage: ${item.stage})`);
      });
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testDepartmentAPI();
