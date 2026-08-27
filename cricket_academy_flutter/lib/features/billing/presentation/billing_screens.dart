import 'package:flutter/material.dart';

class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Billing & Invoices')),
      body: const Padding(
        padding: EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Monthly Subscription: ₹200.00'),
              SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text('Razorpay Payment Checkout flow placeholder'),
                ),
              ),
              SizedBox(height: 20),
              Text('Invoices Ledger & Dues list placeholder'),
            ],
          ),
        ),
      ),
    );
  }
}
