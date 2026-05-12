import { supabase } from '../supabaseClient';
import { createNotification, notifyAdmins } from './notifications';

export async function checkOverdueFees() {
  const today = new Date().toISOString().split('T')[0];
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('entity_type', 'student')
    .in('status', ['pending', 'overdue'])
    .lt('due_date', today);

  if (error) {
    console.error('Overdue fee check failed:', error);
    return { ok: false, error };
  }

  for (const payment of payments || []) {
    const { data: student } = await supabase
      .from('admissions')
      .select('id, name, email, cnic')
      .eq('id', payment.entity_id)
      .maybeSingle();

    if (!student) continue;

    const installmentText = payment.installment_number
      ? `Installment ${payment.installment_number}`
      : payment.description || 'Fee payment';

    await createNotification({
      userId: student.id,
      role: 'student',
      type: 'fee_overdue',
      title: 'Fee Payment Overdue',
      message: `${installmentText} of Rs. ${payment.amount} is overdue since ${payment.due_date}.`,
      link: '/student/finance',
      sendEmail: true,
      emailData: {
        email: student.email,
        name: student.name,
        title: 'Fee Payment Overdue',
        message: `${installmentText} of Rs. ${payment.amount} is overdue since ${payment.due_date}.`
      }
    });

    await notifyAdmins({
      type: 'fee_overdue',
      title: 'Student Fee Overdue',
      message: `${student.name} — ${installmentText} (Rs. ${payment.amount}) overdue.`,
      link: '/admin/finance',
      sendEmail: true,
      emailData: {
        title: 'Student Fee Overdue',
        message: `${student.name} — ${installmentText} (Rs. ${payment.amount}) overdue.`
      }
    });
  }

  return { ok: true, count: payments?.length || 0 };
}

export async function checkUpcomingFeeReminders(daysAhead = 3) {
  const target = new Date();
  target.setDate(target.getDate() + daysAhead);
  const dueDate = target.toISOString().split('T')[0];

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .eq('entity_type', 'student')
    .eq('status', 'pending')
    .eq('due_date', dueDate);

  if (error) {
    console.error('Fee reminder check failed:', error);
    return { ok: false, error };
  }

  for (const payment of payments || []) {
    const { data: student } = await supabase
      .from('admissions')
      .select('id, name, email')
      .eq('id', payment.entity_id)
      .maybeSingle();

    if (!student) continue;

    await createNotification({
      userId: student.id,
      role: 'student',
      type: 'fee_reminder',
      title: 'Fee Installment Due Soon',
      message: `Your fee installment of Rs. ${payment.amount} is due on ${payment.due_date}.`,
      link: '/student/finance',
      sendEmail: true,
      emailData: {
        email: student.email,
        name: student.name,
        title: 'Fee Installment Due Soon',
        message: `Your fee installment of Rs. ${payment.amount} is due on ${payment.due_date}.`
      }
    });
  }

  return { ok: true, count: payments?.length || 0 };
}
