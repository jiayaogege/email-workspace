// 邮件发送功能测试脚本
const fetch = require('node-fetch');

async function testEmailAPI() {
    try {
        // 测试邮件发送API
        const response = await fetch('http://localhost:3000/api/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'test@example.com',
                subject: '测试邮件',
                body: '这是一封测试邮件，用于验证邮件发送功能是否正常工作。'
            })
        });

        const result = await response.json();
        console.log('邮件发送API响应:', result);
        
        if (response.ok) {
            console.log('✅ 邮件发送API测试成功');
        } else {
            console.log('❌ 邮件发送API测试失败:', result.message || result.error);
        }
    } catch (error) {
        console.log('❌ 邮件发送API测试出错:', error.message);
    }
}

async function testEmailAccountsAPI() {
    try {
        // 测试邮箱账户管理API
        const response = await fetch('http://localhost:3000/api/email/accounts');
        const result = await response.json();
        console.log('邮箱账户API响应:', result);
        
        if (response.ok) {
            console.log('✅ 邮箱账户API测试成功');
        } else {
            console.log('❌ 邮箱账户API测试失败:', result.message || result.error);
        }
    } catch (error) {
        console.log('❌ 邮箱账户API测试出错:', error.message);
    }
}

// 运行测试
async function runTests() {
    console.log('开始测试邮件发送功能...\n');
    
    await testEmailAccountsAPI();
    console.log('---');
    await testEmailAPI();
    
    console.log('\n测试完成');
}

runTests().catch(console.error);